-- Run once in Supabase SQL Editor.
-- Adds the category field to old profiles and backfills it from existing products.

alter table public.profiles
  add column if not exists category text not null default '';

update public.profiles p
set category = sub.category
from (
  select owner_id, min(category) as category
  from public.products
  where category is not null and category <> ''
  group by owner_id
) as sub
where p.id = sub.owner_id
  and (p.category is null or p.category = '');
