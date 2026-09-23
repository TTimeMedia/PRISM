-- PRISM — beta feedback: photos on milestones
-- Holds the object path (not a URL) of a photo in the private `memories`
-- bucket, under {user_id}/milestones/. Same convention as
-- profiles.profile_photo_url: private buckets are read via short-lived
-- signed URLs — see docs/SECURITY.md §5.

alter table public.milestones
  add column image_path text;
