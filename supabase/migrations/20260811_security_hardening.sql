-- Security Hardening Migration
-- 1) Prevent non-admins from mutating sensitive profile fields (is_admin, status)
create or replace function public.check_profile_update_security()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if (new.is_admin is distinct from old.is_admin) then
      raise exception 'غير مسموح للمستخدم بتعديل رتبة الأدمن (is_admin)';
    end if;
    if (new.status is distinct from old.status) then
      raise exception 'غير مسموح للمستخدم بتعديل حالة الحساب (status)';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profile_update_security on public.profiles;
create trigger profile_update_security
  before update on public.profiles
  for each row execute function public.check_profile_update_security();

-- 2) Prevent non-admins from approving their own product status
create or replace function public.check_product_update_security()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if (new.status is distinct from old.status) then
      raise exception 'غير مسموح للمستخدم بتعديل حالة المنتج مباشرة';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists product_update_security on public.products;
create trigger product_update_security
  before update on public.products
  for each row execute function public.check_product_update_security();

-- 3) Force product status to 'pending' on insert for non-admins
create or replace function public.check_product_insert_security()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.status := 'pending';
  end if;
  return new;
end;
$$;

drop trigger if exists product_insert_security on public.products;
create trigger product_insert_security
  before insert on public.products
  for each row execute function public.check_product_insert_security();
