-- Run this file once in Supabase: SQL Editor > New query > Run.
create extension if not exists "uuid-ossp";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  family_name text not null default '', city text not null default '', whatsapp text not null default '',
  bio text, status text not null default 'pending' check (status in ('pending','approved','rejected')),
  is_admin boolean not null default false, created_at timestamptz not null default now()
);
create table public.products (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null, description text, price numeric(10,2) not null check (price > 0), category text not null,
  image_url text, status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
-- Public requests submitted from the registration form. They do not create a family account.
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  family_name text not null, city text not null, category text not null, whatsapp text not null,
  bio text, status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create index products_visible_idx on public.products(status, created_at desc);
create index products_owner_idx on public.products(owner_id);

-- Automatically creates the profile row after every authenticated sign-up.
create or replace function public.create_profile_for_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, family_name, city, whatsapp)
  values (new.id, coalesce(new.raw_user_meta_data->>'family_name', ''), coalesce(new.raw_user_meta_data->>'city', ''), coalesce(new.raw_user_meta_data->>'whatsapp', new.phone, ''))
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger auth_user_profile after insert on auth.users for each row execute procedure public.create_profile_for_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.applications enable row level security;
create policy "approved profiles are public" on public.profiles for select using (status = 'approved' or id = auth.uid() or public.is_admin());
create policy "users update their profile" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "approved products are public" on public.products for select using (status = 'approved' or owner_id = auth.uid() or public.is_admin());
create policy "family inserts its products" on public.products for insert with check (owner_id = auth.uid());
create policy "family updates its products" on public.products for update using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
create policy "family deletes its products" on public.products for delete using (owner_id = auth.uid() or public.is_admin());
create policy "anyone can submit an application" on public.applications for insert with check (status = 'pending');
create policy "admins manage applications" on public.applications for all using (public.is_admin()) with check (public.is_admin());

-- Product images bucket and safe per-user folders.
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict (id) do nothing;
create policy "public product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "families upload own images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "families delete own images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- After you create your own account, run this once with your email to make it admin:
-- update public.profiles set is_admin = true, status = 'approved' where id = (select id from auth.users where email = 'YOUR_EMAIL');
