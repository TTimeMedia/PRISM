import { isSupportKind, submitSupportRequest } from '../support';

const mockInvoke = jest.fn();
const mockUpload = jest.fn();

jest.mock('../../supabase/client', () => ({
  supabase: {
    functions: { invoke: (...args: unknown[]) => mockInvoke(...args) },
    storage: { from: () => ({ upload: (...args: unknown[]) => mockUpload(...args) }) },
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockInvoke.mockResolvedValue({ data: { emailed: true }, error: null });
  mockUpload.mockResolvedValue({ error: null });
  globalThis.fetch = jest.fn().mockResolvedValue({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(4)),
  }) as never;
});

describe('submitSupportRequest', () => {
  it('sends the request to submit-support, trimmed, with no screenshot', async () => {
    await expect(
      submitSupportRequest({ userId: 'u1', kind: 'contact', message: '  Hello  ' }),
    ).resolves.toEqual({ emailed: true, screenshotDropped: false });

    expect(mockUpload).not.toHaveBeenCalled();
    const [name, { body }] = mockInvoke.mock.calls[0];
    expect(name).toBe('submit-support');
    expect(body).toMatchObject({ kind: 'contact', message: 'Hello', screenshotPath: null });
  });

  it("uploads an attached screenshot into the person's own support folder first", async () => {
    await submitSupportRequest({
      userId: 'u1',
      kind: 'problem',
      message: 'Broken',
      screen: '/care',
      screenshotUri: 'file:///shot.jpg',
    });

    const path = mockUpload.mock.calls[0][0] as string;
    expect(path).toMatch(/^u1\/support\/.+\.jpg$/);
    expect(mockInvoke.mock.calls[0][1].body).toMatchObject({
      screenshotPath: path,
      screen: '/care',
    });
  });

  it('reads the bare path iOS screenshots come back as through a file:// URI', async () => {
    await submitSupportRequest({
      userId: 'u1',
      kind: 'problem',
      message: 'Broken',
      screenshotUri: '/private/var/mobile/tmp/ReactNative/shot.jpg',
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'file:///private/var/mobile/tmp/ReactNative/shot.jpg',
    );
    expect(mockUpload).toHaveBeenCalled();
  });

  it('still sends the report when the screenshot cannot be uploaded', async () => {
    mockUpload.mockResolvedValue({ error: new Error('storage down') });

    await expect(
      submitSupportRequest({
        userId: 'u1',
        kind: 'problem',
        message: 'Broken',
        screenshotUri: 'file:///shot.jpg',
      }),
    ).resolves.toEqual({ emailed: true, screenshotDropped: true });
    expect(mockInvoke.mock.calls[0][1].body).toMatchObject({ screenshotPath: null });
  });

  it('fails loudly when the function refuses', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: new Error('429') });
    await expect(
      submitSupportRequest({ userId: 'u1', kind: 'privacy', message: 'Hi' }),
    ).rejects.toThrow('429');
  });
});

it('knows the four kinds of request', () => {
  expect(['contact', 'problem', 'privacy', 'feedback'].every(isSupportKind)).toBe(true);
  expect(isSupportKind('billing')).toBe(false);
});
