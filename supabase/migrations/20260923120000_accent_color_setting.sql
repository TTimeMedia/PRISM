-- PRISM — Appearance: user-selectable accent color theme
-- Stored per account so the choice follows the user across devices. The
-- valid keys live in @prism/ui's ACCENT_THEMES; an unrecognised value
-- falls back to the default ('cyan') client-side, so new themes can ship
-- without a migration.

alter table public.settings
  add column accent_color text not null default 'cyan';
