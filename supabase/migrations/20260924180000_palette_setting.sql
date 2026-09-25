-- Prism — Appearance: whole-app color palette
-- Stored per account so the choice follows the person across devices. Valid
-- keys live in @prism/ui's PALETTES; an unrecognised value falls back to the
-- default client-side, so new palettes ship without a migration.
--
-- Existing accounts keep the original colors ('prism'); accounts created from
-- now on start on the calmer 'slate'.

alter table public.settings
  add column if not exists palette text not null default 'prism';

alter table public.settings
  alter column palette set default 'slate';
