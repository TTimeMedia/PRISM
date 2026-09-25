-- PRISM — beta feedback: calendar integration for appointments
-- Adds the opt-in master switch for device-calendar sync. Off by
-- default: calendar permission is only ever requested when the user
-- explicitly turns this on from Settings, never eagerly.

alter table public.settings
  add column calendar_sync_enabled boolean not null default false;
