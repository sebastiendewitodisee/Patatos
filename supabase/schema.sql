-- Patatos - Supabase schema proposal (content + comments + planning)
-- Execute in Supabase SQL Editor.

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

create table if not exists public.content_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  lang text not null default 'fr',
  title text not null,
  excerpt text,
  body text not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_posts_lang_check check (lang in ('fr', 'nl')),
  constraint content_posts_title_not_empty check (char_length(btrim(title)) > 0),
  constraint content_posts_body_not_empty check (char_length(btrim(body)) > 0)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.content_posts(id) on delete cascade,
  author_name text not null,
  message text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  constraint comments_author_name_not_empty check (char_length(btrim(author_name)) > 0),
  constraint comments_author_name_len_check check (char_length(author_name) <= 120),
  constraint comments_message_not_empty check (char_length(btrim(message)) > 0),
  constraint comments_message_len_check check (char_length(message) <= 2000)
);

create table if not exists public.planning_items (
  id uuid primary key default gen_random_uuid(),
  lang text not null default 'fr',
  phase_id text not null default 'preparation',
  type text not null default 'task',
  title text not null,
  description text,
  period text,
  status text not null default 'todo',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint planning_items_lang_check check (lang in ('fr', 'nl')),
  constraint planning_items_phase_id_check check (phase_id in ('preparation', 'plantation', 'suivi', 'recolte', 'conservation')),
  constraint planning_items_type_check check (type in ('task', 'preparation', 'plantation', 'suivi', 'recolte', 'conservation')),
  constraint planning_items_status_check check (status in ('todo', 'doing', 'done')),
  constraint planning_items_title_not_empty check (char_length(btrim(title)) > 0)
);

alter table public.planning_items
add column if not exists phase_id text not null default 'preparation';

alter table public.planning_items
add column if not exists type text not null default 'task';

alter table public.planning_items
drop constraint if exists planning_items_lang_check;

alter table public.planning_items
add constraint planning_items_lang_check check (lang in ('fr', 'nl'));

alter table public.planning_items
drop constraint if exists planning_items_phase_id_check;

alter table public.planning_items
add constraint planning_items_phase_id_check check (phase_id in ('preparation', 'plantation', 'suivi', 'recolte', 'conservation'));

alter table public.planning_items
drop constraint if exists planning_items_type_check;

alter table public.planning_items
add constraint planning_items_type_check check (type in ('task', 'preparation', 'plantation', 'suivi', 'recolte', 'conservation'));

create unique index if not exists idx_content_posts_slug on public.content_posts (slug);
create index if not exists idx_content_posts_published on public.content_posts (published);
create index if not exists idx_comments_post_id on public.comments (post_id);
create index if not exists idx_comments_is_approved on public.comments (is_approved);
create index if not exists idx_planning_items_lang_sort_order on public.planning_items (lang, sort_order);
create index if not exists idx_planning_items_lang_phase_id_sort_order on public.planning_items (lang, phase_id, sort_order);

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

alter table public.content_posts enable row level security;
alter table public.comments enable row level security;
alter table public.planning_items enable row level security;

drop policy if exists "content_posts_select_published_anon" on public.content_posts;
create policy "content_posts_select_published_anon"
on public.content_posts
for select
to anon
using (published = true);

drop policy if exists "content_posts_select_all_authenticated" on public.content_posts;
create policy "content_posts_select_all_authenticated"
on public.content_posts
for select
to authenticated
using (true);

drop policy if exists "content_posts_insert_authenticated" on public.content_posts;
create policy "content_posts_insert_authenticated"
on public.content_posts
for insert
to authenticated
with check (true);

drop policy if exists "content_posts_update_authenticated" on public.content_posts;
create policy "content_posts_update_authenticated"
on public.content_posts
for update
to authenticated
using (true)
with check (true);

drop policy if exists "content_posts_delete_authenticated" on public.content_posts;
create policy "content_posts_delete_authenticated"
on public.content_posts
for delete
to authenticated
using (true);

drop policy if exists "comments_insert_anon" on public.comments;
create policy "comments_insert_anon"
on public.comments
for insert
to anon
with check (true);

drop policy if exists "comments_insert_authenticated" on public.comments;
create policy "comments_insert_authenticated"
on public.comments
for insert
to authenticated
with check (true);

drop policy if exists "comments_select_approved_anon" on public.comments;
create policy "comments_select_approved_anon"
on public.comments
for select
to anon
using (is_approved = true);

drop policy if exists "comments_select_all_authenticated" on public.comments;
create policy "comments_select_all_authenticated"
on public.comments
for select
to authenticated
using (true);

drop policy if exists "comments_update_authenticated" on public.comments;
create policy "comments_update_authenticated"
on public.comments
for update
to authenticated
using (true)
with check (true);

drop policy if exists "comments_delete_authenticated" on public.comments;
create policy "comments_delete_authenticated"
on public.comments
for delete
to authenticated
using (true);

drop policy if exists "planning_items_select_anon" on public.planning_items;
create policy "planning_items_select_anon"
on public.planning_items
for select
to anon
using (true);

drop policy if exists "planning_items_select_authenticated" on public.planning_items;
create policy "planning_items_select_authenticated"
on public.planning_items
for select
to authenticated
using (true);

drop policy if exists "planning_items_insert_authenticated" on public.planning_items;
create policy "planning_items_insert_authenticated"
on public.planning_items
for insert
to authenticated
with check (true);

drop policy if exists "planning_items_update_authenticated" on public.planning_items;
create policy "planning_items_update_authenticated"
on public.planning_items
for update
to authenticated
using (true)
with check (true);

drop policy if exists "planning_items_delete_authenticated" on public.planning_items;
create policy "planning_items_delete_authenticated"
on public.planning_items
for delete
to authenticated
using (true);

grant select on table public.content_posts to anon, authenticated;
grant insert, update, delete on table public.content_posts to authenticated;

grant select on table public.comments to anon, authenticated;
grant insert on table public.comments to anon, authenticated;
grant update, delete on table public.comments to authenticated;

grant select on table public.planning_items to anon, authenticated;
grant insert, update, delete on table public.planning_items to authenticated;
