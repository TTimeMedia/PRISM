import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabase/client';

/**
 * Screens 54/55 (Profile / Edit Profile). The `profile-photos` bucket
 * already exists with per-user RLS (supabase/migrations) — this is a
 * real upload, not a placeholder field. Library-only (no camera capture)
 * keeps this to what the screen actually asks for.
 */
export async function pickProfilePhoto(): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0];
}

/**
 * Uploads to `{user_id}/profile.<ext>` (upsert, so re-uploading replaces
 * the same object) and returns the bucket object path to store in
 * `profiles.profile_photo_url` — see docs/DECISIONS.md § YOU for why
 * that column holds a path, not a public URL.
 */
export async function uploadProfilePhoto(
  userId: string,
  asset: ImagePicker.ImagePickerAsset,
): Promise<string> {
  const response = await fetch(asset.uri);
  const arrayBuffer = await response.arrayBuffer();
  const extension = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/profile.${extension}`;

  const { error } = await supabase.storage.from('profile-photos').upload(path, arrayBuffer, {
    contentType: asset.mimeType || 'image/jpeg',
    upsert: true,
  });
  if (error) throw error;
  return path;
}
