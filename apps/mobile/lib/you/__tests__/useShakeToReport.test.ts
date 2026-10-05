import { renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { useShakeToReport } from '../useShakeToReport';

type Reading = { x: number; y: number; z: number };
let mockListener: ((reading: Reading) => void) | null = null;
const mockRemove = jest.fn();
let mockPath = '/care';

jest.mock('expo-sensors', () => ({
  Accelerometer: {
    setUpdateInterval: jest.fn(),
    addListener: (listener: (reading: Reading) => void) => {
      mockListener = listener;
      return { remove: mockRemove };
    },
  },
}));

jest.mock('react-native-view-shot', () => ({
  captureScreen: jest.fn().mockResolvedValue('file:///shot.jpg'),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  usePathname: () => mockPath,
}));

const jolt = { x: 2, y: 2, z: 1 };
const still = { x: 0, y: 0, z: 1 };

beforeEach(() => {
  jest.clearAllMocks();
  mockListener = null;
  mockPath = '/care';
  useAppStore.setState({ shakeToReport: true });
});

describe('useShakeToReport', () => {
  it('opens a problem report with a screenshot after a shake', async () => {
    renderHook(() => useShakeToReport(true));

    mockListener?.(jolt);
    mockListener?.(jolt);

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/you/support/[kind]',
        params: { kind: 'problem', from: '/care', shot: 'file:///shot.jpg' },
      }),
    );
  });

  it('ignores ordinary movement and a single bump', async () => {
    renderHook(() => useShakeToReport(true));

    mockListener?.(still);
    mockListener?.(jolt);
    mockListener?.(still);

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(router.push).not.toHaveBeenCalled();
  });

  it("doesn't listen when turned off, locked or signed out", () => {
    useAppStore.setState({ shakeToReport: false });
    const turnedOff = renderHook(() => useShakeToReport(true));
    expect(mockListener).toBeNull();
    turnedOff.unmount();

    useAppStore.setState({ shakeToReport: true });
    renderHook(() => useShakeToReport(false));
    expect(mockListener).toBeNull();
  });

  it("doesn't open a second report on top of the report screen", async () => {
    mockPath = '/you/support/problem';
    renderHook(() => useShakeToReport(true));

    mockListener?.(jolt);
    mockListener?.(jolt);

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(router.push).not.toHaveBeenCalled();
  });
});
