-- Run once in Supabase SQL Editor. Safe to re-run.
-- 1) Make the profile trigger robust for every newly-created auth user.
create or replace function public.create_profile_for_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, family_name, city, whatsapp, category, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'family_name', 'متجر جديد'),
    coalesce(new.raw_user_meta_data->>'city', ''),
    coalesce(new.raw_user_meta_data->>'whatsapp', new.phone, ''),
    coalesce(new.raw_user_meta_data->>'category', ''),
    'pending'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists auth_user_profile on auth.users;
create trigger auth_user_profile
  after insert on auth.users
  for each row execute procedure public.create_profile_for_user();

-- 2) Repair every existing user that was created before the trigger existed.
insert into public.profiles (id, family_name, city, whatsapp, status)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'family_name', 'متجر جديد'),
  coalesce(u.raw_user_meta_data->>'city', ''),
  coalesce(u.raw_user_meta_data->>'whatsapp', u.phone, ''),
  'pending'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 3) Allow a signed-in family to restore only its own pending profile if needed.
drop policy if exists "users create own pending profile" on public.profiles;
create policy "users create own pending profile"
on public.profiles for insert to authenticated
with check (id = auth.uid() and status = 'pending' and is_admin = false);
