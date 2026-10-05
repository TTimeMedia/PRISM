import { Platform, type ImageSourcePropType } from 'react-native';
import type { PaletteKey } from '@prism/ui';

/**
 * The home-screen icon, one per palette. Slate is the app's own icon; the
 * others are alternate icons set up by the `expo-alternate-app-icons` plugin
 * in app.json, named the palette's label (iOS wants PascalCase names).
 * The choice lives on the phone itself, not in settings.
 */

export const APP_ICONS: { key: PaletteKey; label: string; image: ImageSourcePropType }[] = [
  { key: 'slate', label: 'Slate', image: require('../../assets/images/app-icons/icon-slate.png') },
  { key: 'mist', label: 'Mist', image: require('../../assets/images/app-icons/icon-mist.png') },
  { key: 'prism', label: 'Prism', image: require('../../assets/images/app-icons/icon-prism.png') },
  { key: 'ocean', label: 'Ocean', image: require('../../assets/images/app-icons/icon-ocean.png') },
  {
    key: 'forest',
    label: 'Forest',
    image: require('../../assets/images/app-icons/icon-forest.png'),
  },
  { key: 'ember', label: 'Ember', image: require('../../assets/images/app-icons/icon-ember.png') },
  { key: 'dusk', label: 'Dusk', image: require('../../assets/images/app-icons/icon-dusk.png') },
  {
    key: 'blossom',
    label: 'Blossom',
    image: require('../../assets/images/app-icons/icon-blossom.png'),
  },
];

const DEFAULT_ICON: PaletteKey = 'slate';

type IconModule = typeof import('expo-alternate-app-icons');

/** Missing on web and on any build made before the icons were added, so it's loaded defensively. */
function iconModule(): IconModule | null {
  if (Platform.OS === 'web') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-alternate-app-icons') as IconModule;
    return mod.supportsAlternateIcons ? mod : null;
  } catch {
    return null;
  }
}

export function canChangeAppIcon(): boolean {
  return iconModule() !== null;
}

/** The icon on the home screen right now. */
export function currentAppIcon(): PaletteKey {
  const name = iconModule()?.getAppIconName();
  return APP_ICONS.find((icon) => icon.label === name)?.key ?? DEFAULT_ICON;
}

export async function setAppIcon(key: PaletteKey): Promise<void> {
  const mod = iconModule();
  if (!mod) return;
  const icon = APP_ICONS.find((entry) => entry.key === key);
  await mod.setAlternateAppIcon(!icon || key === DEFAULT_ICON ? null : icon.label);
}
