-- PRISM — Foundation migration 8/8
-- Storage buckets and their RLS policies. All buckets are private — see
-- docs/SECURITY.md §5: "Never create public buckets for sensitive PRISM
-- information." Objects are stored under a `{user_id}/...` path prefix;
-- ownership is enforced by checking that prefix against auth.uid(), the
-- same pattern as every other table's RLS.
--
-- (Bucket existence is also declared in supabase/config.toml for local
-- `supabase start` convenience — this migration is what actually creates
-- them in any real project, local or remote, and is the source of truth.)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('profile-photos', 'profile-photos', false, 10485760, array['image/png', 'image/jpeg', 'image/webp']),
  ('memories', 'memories', false, 26214400, array['image/png', 'image/jpeg', 'image/webp', 'image/heic']),
  ('documents', 'documents', false, 52428800, null),
  ('attachments', 'attachments', false, 26214400, null)
on conflict (id) do nothing;

-- profile-photos ---------------------------------------------------------------
create policy "profile_photos_select_own" on storage.objects
  for select using (
    bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "profile_photos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "profile_photos_update_own" on storage.objects
  for update using (
    bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "profile_photos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- memories (P1) ------------------------------------------------------------------
create policy "memories_bucket_select_own" on storage.objects
  for select using (
    bucket_id = 'memories' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "memories_bucket_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'memories' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "memories_bucket_update_own" on storage.objects
  for update using (
    bucket_id = 'memories' and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'memories' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "memories_bucket_delete_own" on storage.objects
  for delete using (
    bucket_id = 'memories' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- documents (P1) — high security, see docs/SECURITY.md §5 -----------------------
create policy "documents_bucket_select_own" on storage.objects
  for select using (
    bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "documents_bucket_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "documents_bucket_update_own" on storage.objects
  for update using (
    bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "documents_bucket_delete_own" on storage.objects
  for delete using (
    bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- attachments --------------------------------------------------------------------
create policy "attachments_select_own" on storage.objects
  for select using (
    bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "attachments_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "attachments_update_own" on storage.objects
  for update using (
    bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "attachments_delete_own" on storage.objects
  for delete using (
    bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text
  );
