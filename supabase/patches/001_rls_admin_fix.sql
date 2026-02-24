-- Patatos - Patch 001: admin-friendly RLS + planning lang check + updated_at triggers
-- Safe to run multiple times in Supabase SQL Editor.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.content_posts enable row level security;
alter table public.comments enable row level security;
alter table public.planning_items enable row level security;

alter table public.planning_items
drop constraint if exists planning_items_lang_check;

alter table public.planning_items
add constraint planning_items_lang_check check (lang in ('fr', 'nl'));

drop trigger if exists trg_content_posts_set_updated_at on public.content_posts;
create trigger trg_content_posts_set_updated_at
before update on public.content_posts
for each row
execute function public.set_updated_at();

drop trigger if exists trg_planning_items_set_updated_at on public.planning_items;
create trigger trg_planning_items_set_updated_at
before update on public.planning_items
for each row
execute function public.set_updated_at();

drop policy if exists "content_posts_select_all_authenticated" on public.content_posts;
create policy "content_posts_select_all_authenticated"
on public.content_posts
for select
to authenticated
using (true);

drop policy if exists "comments_insert_authenticated" on public.comments;
create policy "comments_insert_authenticated"
on public.comments
for insert
to authenticated
with check (true);

drop policy if exists "comments_select_all_authenticated" on public.comments;
create policy "comments_select_all_authenticated"
on public.comments
for select
to authenticated
using (true);

drop policy if exists "planning_items_select_authenticated" on public.planning_items;
create policy "planning_items_select_authenticated"
on public.planning_items
for select
to authenticated
using (true);

grant select on table public.content_posts to authenticated;
grant select, insert on table public.comments to authenticated;
grant select on table public.planning_items to authenticated;
