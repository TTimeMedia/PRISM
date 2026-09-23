import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabase/client';

const BUCKET = 'memories';

export type EntryImageFolder = 'milestones' | 'journal';

/** What the user did with an entry's photo in one editing session; the screen does the upload/cleanup. */
export interface EntryImageChange {
  /** A newly picked photo, not yet uploaded. */
  asset: ImagePicker.ImagePickerAsset | null;
  /** The already-saved photo was removed (and not replaced). */
  removed: boolean;
}

export type PickEntryImageResult =
  | { status: 'picked'; asset: ImagePicker.ImagePickerAsset }
  | { status: 'denied' }
  | { status: 'canceled' };

/**
 * Milestone and journal photos live in the private `memories` bucket under
 * `{user_id}/milestones/` and `{user_id}/journal/` (per-user RLS already
 * exists — see supabase/migrations). `image_path` on those tables holds the
 * object path, never a URL, the same convention as profile photos
 * (lib/you/profilePhoto.ts). Library-only; permission is requested only
 * when the user taps "Add photo".
 */
export async function pickEntryImage(): Promise<PickEntryImageResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return { status: 'denied' };

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.8,
  });
  const asset = result.assets?.[0];
  if (result.canceled || !asset) return { status: 'canceled' };
  return { status: 'picked', asset };
}

/** Uploads a new object (never overwrites) and returns its path for `milestones.image_path`. */
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
export async function removeEntryImage(path: string | null | undefined): Promise<void> {
  if (!path) return;
  try {
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // Orphaned object; nothing the user needs to know about.
  }
}
