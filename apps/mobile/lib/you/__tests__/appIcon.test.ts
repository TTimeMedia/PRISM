import { canChangeAppIcon, currentAppIcon, setAppIcon } from '../appIcon';

const mockSet = jest.fn();
const mockGetName = jest.fn();
let mockSupported = true;

jest.mock('expo-alternate-app-icons', () => ({
  get supportsAlternateIcons() {
    return mockSupported;
  },
  setAlternateAppIcon: (...args: unknown[]) => mockSet(...args),
  getAppIconName: () => mockGetName(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockSupported = true;
  mockSet.mockResolvedValue(null);
  mockGetName.mockReturnValue(null);
});

describe('app icon', () => {
  it('reads the default icon as Slate', () => {
    expect(currentAppIcon()).toBe('slate');
  });

  it('reads an alternate icon back as its palette', () => {
    mockGetName.mockReturnValue('Blossom');
    expect(currentAppIcon()).toBe('blossom');
  });

  it('sets an alternate by its name and resets for Slate', async () => {
    await setAppIcon('ember');
    await setAppIcon('slate');
    expect(mockSet.mock.calls).toEqual([['Ember'], [null]]);
  });

  it('does nothing where the phone cannot change icons', async () => {
    mockSupported = false;
    expect(canChangeAppIcon()).toBe(false);
    await setAppIcon('ember');
    expect(mockSet).not.toHaveBeenCalled();
  });
});
