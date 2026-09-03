import { clearPin, hasPin, setPin, verifyPin } from '../pinStorage';

const mockStore = new Map<string, string>();

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn((key: string, value: string) => {
    mockStore.set(key, value);
    return Promise.resolve();
  }),
  getItemAsync: jest.fn((key: string) => Promise.resolve(mockStore.get(key) ?? null)),
  deleteItemAsync: jest.fn((key: string) => {
    mockStore.delete(key);
    return Promise.resolve();
  }),
}));

describe('pinStorage', () => {
  beforeEach(() => {
    mockStore.clear();
  });

  it('reports no PIN set before one is stored', async () => {
    expect(await hasPin()).toBe(false);
  });

  it('verifies a correct PIN after it is set', async () => {
    await setPin('1234');
    expect(await hasPin()).toBe(true);
    expect(await verifyPin('1234')).toBe(true);
  });

  it('rejects an incorrect PIN', async () => {
    await setPin('1234');
    expect(await verifyPin('0000')).toBe(false);
  });

  it('rejects any PIN once cleared', async () => {
    await setPin('1234');
    await clearPin();
    expect(await hasPin()).toBe(false);
    expect(await verifyPin('1234')).toBe(false);
  });
});
