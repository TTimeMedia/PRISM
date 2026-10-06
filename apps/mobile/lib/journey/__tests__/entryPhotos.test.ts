import { entryPhotos, photoColumns } from '../entryPhotos';
import { saveWithPhotos } from '../entryImage';

const mockUpload = jest.fn();
const mockRemove = jest.fn();

jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));

jest.mock('../../supabase/client', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: (...args: unknown[]) => mockUpload(...args),
        remove: (...args: unknown[]) => mockRemove(...args),
      }),
    },
  },
}));

const asset = (name: string) => ({ uri: `file:///${name}.jpg`, mimeType: 'image/jpeg' }) as never;

beforeEach(() => {
  jest.clearAllMocks();
  mockUpload.mockResolvedValue({ error: null });
  mockRemove.mockResolvedValue({ error: null });
  globalThis.fetch = jest.fn().mockResolvedValue({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(4)),
  }) as never;
});

describe('entryPhotos', () => {
  it('reads the list, falling back to the single photo of an older row', () => {
    expect(entryPhotos({ image_paths: ['a', 'b'], image_path: 'a' })).toEqual(['a', 'b']);
    expect(entryPhotos({ image_paths: [], image_path: 'old' })).toEqual(['old']);
    expect(entryPhotos({ image_path: null })).toEqual([]);
  });

  it('writes the list and keeps the first photo in the single column for older builds', () => {
    expect(photoColumns(['a', 'b'])).toEqual({ image_paths: ['a', 'b'], image_path: 'a' });
    expect(photoColumns([])).toEqual({ image_paths: [], image_path: null });
    expect(photoColumns(['1', '2', '3', '4', '5', '6']).image_paths).toHaveLength(5);
  });
});

describe('saveWithPhotos', () => {
  it('uploads new photos after the kept ones, saves, then deletes the ones removed', async () => {
    const save = jest.fn().mockResolvedValue('saved');

    await expect(
      saveWithPhotos({
        userId: 'u1',
        folder: 'journal',
        change: { kept: ['u1/journal/keep.jpg'], added: [asset('new')] },
        previous: ['u1/journal/keep.jpg', 'u1/journal/gone.jpg'],
        save,
      }),
    ).resolves.toBe('saved');

    const uploadedPath = mockUpload.mock.calls[0][0] as string;
    expect(uploadedPath).toMatch(/^u1\/journal\/.+\.jpg$/);
    expect(save).toHaveBeenCalledWith({
      image_paths: ['u1/journal/keep.jpg', uploadedPath],
      image_path: 'u1/journal/keep.jpg',
    });
    expect(mockRemove).toHaveBeenCalledWith(['u1/journal/gone.jpg']);
  });

  it('never goes over five photos', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    await saveWithPhotos({
      userId: 'u1',
      folder: 'milestones',
      change: {
        kept: ['1', '2', '3', '4'],
        added: [asset('a'), asset('b'), asset('c')],
      },
      previous: ['1', '2', '3', '4'],
      save,
    });

    expect(mockUpload).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0].image_paths).toHaveLength(5);
  });

  it('keeps every saved photo and removes the new uploads if saving fails', async () => {
    const save = jest.fn().mockRejectedValue(new Error('offline'));

    await expect(
      saveWithPhotos({
        userId: 'u1',
        folder: 'journal',
        change: { kept: [], added: [asset('new')] },
        previous: ['u1/journal/old.jpg'],
        save,
      }),
    ).rejects.toThrow('offline');

    const uploadedPath = mockUpload.mock.calls[0][0] as string;
    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(mockRemove).toHaveBeenCalledWith([uploadedPath]);
  });
});
