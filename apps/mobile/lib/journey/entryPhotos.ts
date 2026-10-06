import { MAX_ENTRY_PHOTOS } from '@prism/validation';

export { MAX_ENTRY_PHOTOS };

/**
 * The photos on a journal entry or milestone, in order. Reads `image_paths`,
 * falling back to the single `image_path` for a row saved before entries
 * could hold several (the database keeps the two in step from then on).
 */
export function entryPhotos(record: {
  image_paths?: string[] | null;
  image_path?: string | null;
}): string[] {
  if (record.image_paths && record.image_paths.length > 0) {
    return record.image_paths.slice(0, MAX_ENTRY_PHOTOS);
  }
  return record.image_path ? [record.image_path] : [];
}

/** What to save for a list of photos: the list, and its first one for older app builds. */
export function photoColumns(paths: string[]): {
  image_paths: string[];
  image_path: string | null;
} {
  const kept = paths.slice(0, MAX_ENTRY_PHOTOS);
  return { image_paths: kept, image_path: kept[0] ?? null };
}
