-- Secure public comments flow with Edge Function submit.
-- Safe to run multiple times.

drop policy if exists "comments_insert_anon" on public.comments;

create table if not exists public.comment_rate_limits (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  created_at timestamptz not null default now(),
  constraint comment_rate_limits_ip_hash_not_empty check (char_length(btrim(ip_hash)) > 0)
);

create index if not exists idx_comment_rate_limits_ip_hash_created_at
on public.comment_rate_limits (ip_hash, created_at desc);

alter table public.comment_rate_limits enable row level security;

revoke all on table public.comment_rate_limits from anon, authenticated;
grant select, insert, delete on table public.comment_rate_limits to service_role;
