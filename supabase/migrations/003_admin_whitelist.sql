-- Restrict authenticated admin access to users listed in public.app_admins.
-- Safe to run multiple times.

create table if not exists public.app_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

drop policy if exists "app_admins_select_self_authenticated" on public.app_admins;
create policy "app_admins_select_self_authenticated"
on public.app_admins
for select
to authenticated
using (user_id = auth.uid());

drop function if exists public.is_admin();
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.app_admins
    where user_id = auth.uid()
  );
$$;

drop policy if exists "content_posts_select_all_authenticated" on public.content_posts;
create policy "content_posts_select_all_authenticated"
on public.content_posts
for select
to authenticated
using (public.is_admin());

drop policy if exists "content_posts_insert_authenticated" on public.content_posts;
create policy "content_posts_insert_authenticated"
on public.content_posts
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "content_posts_update_authenticated" on public.content_posts;
create policy "content_posts_update_authenticated"
on public.content_posts
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "content_posts_delete_authenticated" on public.content_posts;
create policy "content_posts_delete_authenticated"
on public.content_posts
for delete
to authenticated
using (public.is_admin());

drop policy if exists "planning_items_select_authenticated" on public.planning_items;
create policy "planning_items_select_authenticated"
on public.planning_items
for select
to authenticated
using (public.is_admin());

drop policy if exists "planning_items_insert_authenticated" on public.planning_items;
create policy "planning_items_insert_authenticated"
on public.planning_items
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "planning_items_update_authenticated" on public.planning_items;
create policy "planning_items_update_authenticated"
on public.planning_items
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "planning_items_delete_authenticated" on public.planning_items;
create policy "planning_items_delete_authenticated"
on public.planning_items
for delete
to authenticated
using (public.is_admin());

drop policy if exists "comments_insert_authenticated" on public.comments;
create policy "comments_insert_authenticated"
on public.comments
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "comments_select_all_authenticated" on public.comments;
create policy "comments_select_all_authenticated"
on public.comments
for select
to authenticated
using (public.is_admin());

drop policy if exists "comments_update_authenticated" on public.comments;
create policy "comments_update_authenticated"
on public.comments
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "comments_delete_authenticated" on public.comments;
create policy "comments_delete_authenticated"
on public.comments
for delete
to authenticated
using (public.is_admin());
