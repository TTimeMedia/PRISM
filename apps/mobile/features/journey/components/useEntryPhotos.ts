import { useState } from 'react';
import type { ImagePickerAsset } from 'expo-image-picker';
import { useToast } from '@prism/ui';
import { pickEntryImages, type EntryPhotoChange } from '../../../lib/journey/entryImage';
import { MAX_ENTRY_PHOTOS } from '../../../lib/journey/entryPhotos';

/**
 * The photos being edited on a journal entry or milestone form: the saved
 * ones still kept, and newly picked ones, up to five in all. Pass `field`
 * to EntryPhotoField and `change` to the form's onSubmit.
 */
export function useEntryPhotos(existing: string[] = []) {
  const { showToast } = useToast();
  const [kept, setKept] = useState<string[]>(existing);
  const [added, setAdded] = useState<ImagePickerAsset[]>([]);

  const add = async () => {
    const room = MAX_ENTRY_PHOTOS - kept.length - added.length;
    if (room <= 0) return;
    const result = await pickEntryImages(room);
    if (result.status === 'picked') {
      setAdded((current) => {
        const known = new Set(current.map((asset) => asset.uri));
        const fresh = result.assets.filter((asset) => !known.has(asset.uri));
        return [...current, ...fresh].slice(0, MAX_ENTRY_PHOTOS - kept.length);
      });
    } else if (result.status === 'denied') {
      showToast("Couldn't open your photos. Please try again.", 'error');
    }
  };

  const change: EntryPhotoChange = { kept, added };

  return {
    change,
    field: {
      kept,
      added,
      onAdd: () => void add(),
      onRemoveKept: (path: string) => setKept((current) => current.filter((p) => p !== path)),
      onRemoveAdded: (asset: ImagePickerAsset) =>
        setAdded((current) => current.filter((a) => a.uri !== asset.uri)),
    },
  };
}
