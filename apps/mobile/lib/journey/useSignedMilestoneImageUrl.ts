import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase/client';

const SIGNED_URL_TTL_SECONDS = 60 * 60;

/**
 * `milestones.image_path` is a private-bucket object path, not a
 * displayable URL — this resolves a short-lived signed URL for it on
 * read. See lib/journey/milestoneImage.ts.
 */
export function useSignedMilestoneImageUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ['milestone-image-signed-url', path],
    queryFn: async (): Promise<string> => {
      const { data, error } = await supabase.storage
        .from('memories')
        .createSignedUrl(path as string, SIGNED_URL_TTL_SECONDS);
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!path,
    staleTime: 30 * 60 * 1000,
  });
}
