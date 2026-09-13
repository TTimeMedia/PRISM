import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase/client';

const SIGNED_URL_TTL_SECONDS = 60 * 60;

/**
 * `profiles.profile_photo_url` stores a private-bucket object path, not a
 * displayable URL — this resolves a short-lived signed URL for it on
 * read. See lib/you/profilePhoto.ts and docs/DECISIONS.md § YOU.
 */
export function useSignedProfilePhotoUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ['profile-photo-signed-url', path],
    queryFn: async (): Promise<string> => {
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .createSignedUrl(path as string, SIGNED_URL_TTL_SECONDS);
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!path,
    staleTime: 30 * 60 * 1000,
  });
}
