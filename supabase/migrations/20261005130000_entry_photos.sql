-- PRISM — up to five photos on a journal entry or milestone
-- image_paths holds the object paths (in the private `memories` bucket,
-- under {user_id}/journal/ or {user_id}/milestones/), in the order shown.
--
-- image_path (one photo) stays, always equal to the first of image_paths,
-- so app builds from before this change keep working. A trigger keeps the
-- two in step whichever one a build writes: a newer build writes the list;
-- an older one writes the single path, which then replaces the list.

alter table public.milestones
  add column image_paths text[] not null default '{}'
    check (cardinality(image_paths) <= 5);

alter table public.journal_entries
  add column image_paths text[] not null default '{}'
    check (cardinality(image_paths) <= 5);

update public.milestones set image_paths = array[image_path] where image_path is not null;
update public.journal_entries set image_paths = array[image_path] where image_path is not null;

create or replace function public.sync_entry_image_paths()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if cardinality(new.image_paths) = 0 and new.image_path is not null then
      new.image_paths := array[new.image_path];
    end if;
  elsif new.image_paths is not distinct from old.image_paths
    and new.image_path is distinct from old.image_path then
    -- Only the single path changed: an older build edited the photo.
    new.image_paths := case when new.image_path is null then '{}' else array[new.image_path] end;
  end if;
  new.image_path := new.image_paths[1];
  return new;
end;
$$;

create trigger sync_milestones_image_paths
  before insert or update on public.milestones
  for each row execute function public.sync_entry_image_paths();

create trigger sync_journal_entries_image_paths
  before insert or update on public.journal_entries
  for each row execute function public.sync_entry_image_paths();
