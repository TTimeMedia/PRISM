import { Platform, type ImageSourcePropType } from 'react-native';

/**
 * The home-screen icon. Slate is the app's own icon; the others are
 * alternate icons set up by the `expo-alternate-app-icons` plugin in
 * app.json, named by their label (iOS wants PascalCase names). The icons
 * were drawn for the first set of color themes and keep those names; they
 * are chosen separately from the theme.
 * The choice lives on the phone itself, not in settings.
 */

export type AppIconKey =
  'slate' | 'mist' | 'prism' | 'ocean' | 'forest' | 'ember' | 'dusk' | 'blossom';

export const APP_ICONS: { key: AppIconKey; label: string; image: ImageSourcePropType }[] = [
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

const DEFAULT_ICON: AppIconKey = 'slate';

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
export function currentAppIcon(): AppIconKey {
  const name = iconModule()?.getAppIconName();
  return APP_ICONS.find((icon) => icon.label === name)?.key ?? DEFAULT_ICON;
}

export async function setAppIcon(key: AppIconKey): Promise<void> {
  const mod = iconModule();
  if (!mod) return;
  const icon = APP_ICONS.find((entry) => entry.key === key);
  await mod.setAlternateAppIcon(!icon || key === DEFAULT_ICON ? null : icon.label);
}
