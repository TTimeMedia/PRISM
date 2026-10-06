-- Prism — color themes replaced (2026-10-06)
-- The themes now come from @prism/ui's themes.ts, and the default is 'prism'.
-- Saved values from the old set ('slate', 'mist', 'ocean', 'forest',
-- 'blossom') stay as they are: the app reads each as its closest new theme,
-- and the value updates the next time the person chooses.

alter table public.settings
  alter column palette set default 'prism';
