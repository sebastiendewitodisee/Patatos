-- Allow existing admins to manage the whitelist in public.app_admins.
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

drop policy if exists "app_admins_select_all_admins" on public.app_admins;
create policy "app_admins_select_all_admins"
on public.app_admins
for select
to authenticated
using (public.is_admin());

drop policy if exists "app_admins_insert_admins_only" on public.app_admins;
create policy "app_admins_insert_admins_only"
on public.app_admins
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "app_admins_delete_admins_only" on public.app_admins;
create policy "app_admins_delete_admins_only"
on public.app_admins
for delete
to authenticated
using (public.is_admin());

grant select, insert, delete on table public.app_admins to authenticated;
revoke all on table public.app_admins from anon;
