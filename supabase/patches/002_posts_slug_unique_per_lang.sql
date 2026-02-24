-- Make content_posts slug uniqueness scoped by language (lang + slug).
-- Safe to run multiple times.

alter table public.content_posts
drop constraint if exists content_posts_slug_key;

drop index if exists public.content_posts_slug_key;
drop index if exists public.idx_content_posts_slug;

create unique index if not exists content_posts_lang_slug_key
on public.content_posts (lang, slug);
