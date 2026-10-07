import AsyncStorage from '@react-native-async-storage/async-storage';
import { capture, flush, setAnalyticsEnabled } from '../analytics';
import { screenName } from '../events';

const fetchMock = jest.fn();

beforeEach(async () => {
  fetchMock.mockReset().mockResolvedValue({ ok: true, status: 200 });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  (globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
  await setAnalyticsEnabled(false);
});

afterAll(() => {
  (globalThis as unknown as { __DEV__: boolean }).__DEV__ = true;
});

const sentBody = () => JSON.parse(fetchMock.mock.calls[0][1].body);

describe('analytics', () => {
  it('sends nothing without a yes', async () => {
    capture('app_opened');
    await flush();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends anonymous events to the EU region after a yes', async () => {
    await setAnalyticsEnabled(true);
    capture('dose_logged');
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://eu.i.posthog.com/batch/');
    const [event] = sentBody().batch;
    expect(event.event).toBe('dose_logged');
    expect(event.properties).toMatchObject({
      $process_person_profile: false,
      $geoip_disable: true,
    });
    expect(event.properties.distinct_id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('drops waiting events and forgets the install ID when turned off', async () => {
    await setAnalyticsEnabled(true);
    capture('app_opened');
    await flush();
    const firstId = sentBody().batch[0].properties.distinct_id;
    capture('screen_viewed');
    await setAnalyticsEnabled(false);
    expect(await AsyncStorage.getItem('prism-analytics-install-id')).toBeNull();
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await setAnalyticsEnabled(true);
    capture('app_opened');
    await flush();
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).batch[0].properties.distinct_id).not.toBe(
      firstId,
    );
  });

  it('keeps events for the next try when offline', async () => {
    await setAnalyticsEnabled(true);
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    capture('app_opened');
    await flush();
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).batch).toHaveLength(1);
  });
});

describe('screenName', () => {
  it('removes record IDs from routes', () => {
    expect(screenName('/care/medications/3f2a1c9e-77b0-4d1e-9a7c-0c1d2e3f4a5b')).toBe(
      '/care/medications/:id',
    );
    expect(screenName('/journey/entry/42/edit')).toBe('/journey/entry/:id/edit');
    expect(screenName('/today')).toBe('/today');
    expect(screenName('')).toBe('/');
  });
});
