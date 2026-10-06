import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabase/client';
import { MAX_ENTRY_PHOTOS, photoColumns } from './entryPhotos';

const BUCKET = 'memories';

export type EntryImageFolder = 'milestones' | 'journal';

/**
 * What the person did with an entry's photos in one editing session; the
 * screen uploads and cleans up when the form is saved.
 */
export interface EntryPhotoChange {
  /** Already-saved photos still on the entry, in order. */
  kept: string[];
  /** Newly picked photos, not yet uploaded, shown after the kept ones. */
  added: ImagePicker.ImagePickerAsset[];
}

export type PickEntryImagesResult =
  | { status: 'picked'; assets: ImagePicker.ImagePickerAsset[] }
  | { status: 'denied' }
  | { status: 'canceled' };

/**
 * Milestone and journal photos live in the private `memories` bucket under
 * `{user_id}/milestones/` and `{user_id}/journal/` (per-user RLS already
 * exists — see supabase/migrations). `image_paths` on those tables holds the
 * object paths, never URLs, the same convention as profile photos
 * (lib/you/profilePhoto.ts). Library-only.
 *
 * This opens the phone's own photo picker, which needs no permission for
 * Prism to use it: the person picks photos and only those are handed over.
 * So nobody is ever sent to Settings to turn something on, and Prism never
 * gets access to the rest of their library.
 */
export async function pickEntryImages(limit: number): Promise<PickEntryImagesResult> {
  if (limit <= 0) return { status: 'canceled' };
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      allowsMultipleSelection: limit > 1,
      selectionLimit: limit,
      orderedSelection: true,
      quality: 0.8,
    });
    const assets = (result.assets ?? []).slice(0, limit);
    if (result.canceled || assets.length === 0) return { status: 'canceled' };
    return { status: 'picked', assets };
  } catch {
    // The picker itself couldn't open; there is nothing the person can toggle.
    return { status: 'denied' };
  }
}

/** Uploads a new object (never overwrites) and returns its path. */
export async function uploadEntryImage(
  userId: string,
  asset: ImagePicker.ImagePickerAsset,
  folder: EntryImageFolder,
): Promise<string> {
  const response = await fetch(asset.uri);
  const arrayBuffer = await response.arrayBuffer();
  const extension = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `${userId}/${folder}/${unique}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, arrayBuffer, {
    contentType: asset.mimeType || 'image/jpeg',
  });
  if (error) throw error;
  return path;
}

/** Best-effort cleanup — a leftover file is harmless, so failures are swallowed. */
export async function removeEntryImages(paths: (string | null | undefined)[]): Promise<void> {
  const existing = paths.filter((path): path is string => !!path);
  if (existing.length === 0) return;
  try {
    await supabase.storage.from(BUCKET).remove(existing);
  } catch {
    // Orphaned objects; nothing the person needs to know about.
  }
}

/**
 * Saves an entry with its photos. Uploads the newly picked ones, calls
 * `save` with the photo columns to write, and only then deletes photos the
 * person removed. If anything fails, the new uploads are removed again and
 * the error is rethrown, so a failed save leaves no stray files and loses
 * no saved photo.
 */
export async function saveWithPhotos<T>({
  userId,
  folder,
  change,
  previous,
  save,
}: {
  userId: string | undefined;
  folder: EntryImageFolder;
  change: EntryPhotoChange;
  /** The photos the entry had before this edit (empty for a new entry). */
  previous: string[];
  save: (columns: { image_paths: string[]; image_path: string | null }) => Promise<T>;
}): Promise<T> {
  const room = Math.max(0, MAX_ENTRY_PHOTOS - change.kept.length);
  const toUpload = userId ? change.added.slice(0, room) : [];
  const uploaded: string[] = [];
  try {
    for (const asset of toUpload) {
      uploaded.push(await uploadEntryImage(userId as string, asset, folder));
    }
    const result = await save(photoColumns([...change.kept, ...uploaded]));
    await removeEntryImages(previous.filter((path) => !change.kept.includes(path)));
    return result;
  } catch (error) {
    await removeEntryImages(uploaded);
    throw error;
  }
}
