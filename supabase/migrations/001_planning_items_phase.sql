-- Add planning phases/types support for remote planning items.
-- Safe to run multiple times.

alter table public.planning_items
add column if not exists phase_id text not null default 'preparation';

alter table public.planning_items
add column if not exists type text not null default 'task';

alter table public.planning_items
drop constraint if exists planning_items_phase_id_check;

alter table public.planning_items
add constraint planning_items_phase_id_check check (phase_id in ('preparation', 'plantation', 'suivi', 'recolte', 'conservation'));

alter table public.planning_items
drop constraint if exists planning_items_type_check;

alter table public.planning_items
add constraint planning_items_type_check check (type in ('task', 'preparation', 'plantation', 'suivi', 'recolte', 'conservation'));

create index if not exists idx_planning_items_lang_phase_id_sort_order
on public.planning_items (lang, phase_id, sort_order);
