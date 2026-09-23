-- PRISM — beta feedback: photos on journal entries
-- Object path (not a URL) of a photo in the private `memories` bucket,
-- under {user_id}/journal/ — same convention as milestones.image_path.

alter table public.journal_entries
  add column image_path text;
