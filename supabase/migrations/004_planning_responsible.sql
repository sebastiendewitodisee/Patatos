-- Add optional responsible field to planning items.
-- Safe to run multiple times.

alter table public.planning_items
add column if not exists responsible text;

alter table public.planning_items
drop constraint if exists planning_items_responsible_not_empty_check;

alter table public.planning_items
add constraint planning_items_responsible_not_empty_check
check (responsible is null or char_length(btrim(responsible)) > 0);

create index if not exists idx_planning_items_lang_phase_sort
on public.planning_items (lang, phase_id, sort_order);
