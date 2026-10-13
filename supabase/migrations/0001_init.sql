-- =============================================================
-- KILO CLUB — database schema
-- Run this once in the Supabase dashboard → SQL Editor.
-- =============================================================

-- ---------- Profiles & roles ----------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now()
);

-- True when the signed-in user is an admin. SECURITY DEFINER so it can read
-- profiles without tripping the RLS policies that themselves call it.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Create a profile row for every new auth user (email or Google sign-up).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Nobody can change a role through the API unless they are already an admin.
-- (The SQL editor runs as `postgres`, so you can still bootstrap the first admin.)
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and current_user in ('authenticated', 'anon')
     and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ---------- Catalogue -----------------------------------------

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.brands (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  logo_url    text,
  created_at  timestamptz not null default now()
);

create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  brand_id     uuid references public.brands (id) on delete set null,
  category_id  uuid references public.categories (id) on delete set null,
  description  text,
  -- e.g. [{"label": "Protein", "value": "24g"}]
  highlights   jsonb not null default '[]'::jsonb,
  images       text[] not null default '{}',
  badge        text,
  is_active    boolean not null default true,
  is_featured  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_brand_idx on public.products (brand_id);

create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  size        text not null,
  flavour     text,
  price       numeric(10, 2) not null check (price >= 0),
  mrp         numeric(10, 2) check (mrp is null or mrp >= 0),
  in_stock    boolean not null default true,
  sort_order  int not null default 0
);

create index if not exists product_variants_product_idx on public.product_variants (product_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch on public.products;
create trigger products_touch
  before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------- Enquiries, wishlist, settings ---------------------

create table if not exists public.enquiries (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users (id) on delete set null,
  customer_name  text,
  customer_email text,
  -- snapshot of what was enquired: [{product_id, name, brand, size, flavour, price, qty}]
  items          jsonb not null default '[]'::jsonb,
  message        text not null,
  source         text not null default 'product' check (source in ('product', 'cart')),
  created_at     timestamptz not null default now()
);

create index if not exists enquiries_created_idx on public.enquiries (created_at desc);
create index if not exists enquiries_user_idx on public.enquiries (user_id);

create table if not exists public.wishlist_items (
  user_id     uuid not null references auth.users (id) on delete cascade,
  product_id  uuid not null references public.products (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.site_settings (
  id               int primary key default 1 check (id = 1),
  whatsapp_number  text not null default '919037009229',
  product_template text not null default 'Heyy, I''m looking to buy {items}. Is the product available for sale?',
  cart_template    text not null default E'Heyy, I want to buy:\n{items}\nAre they available?',
  price_notice     text not null default 'Prices may vary, so please enquire to confirm!',
  updated_at       timestamptz not null default now()
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- ---------- Row Level Security --------------------------------

alter table public.profiles         enable row level security;
alter table public.categories       enable row level security;
alter table public.brands           enable row level security;
alter table public.products         enable row level security;
alter table public.product_variants enable row level security;
alter table public.enquiries        enable row level security;
alter table public.wishlist_items   enable row level security;
alter table public.site_settings    enable row level security;

-- profiles
drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: update own or admin" on public.profiles;
create policy "profiles: update own or admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- catalogue: everyone reads, only admins write
drop policy if exists "categories: public read" on public.categories;
create policy "categories: public read" on public.categories for select using (true);
drop policy if exists "categories: admin write" on public.categories;
create policy "categories: admin write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "brands: public read" on public.brands;
create policy "brands: public read" on public.brands for select using (true);
drop policy if exists "brands: admin write" on public.brands;
create policy "brands: admin write" on public.brands
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products: public read active" on public.products;
create policy "products: public read active" on public.products
  for select using (is_active or public.is_admin());
drop policy if exists "products: admin write" on public.products;
create policy "products: admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "variants: public read" on public.product_variants;
create policy "variants: public read" on public.product_variants
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_id and (p.is_active or public.is_admin())
    )
  );
drop policy if exists "variants: admin write" on public.product_variants;
create policy "variants: admin write" on public.product_variants
  for all using (public.is_admin()) with check (public.is_admin());

-- enquiries: anyone (even guests) can log one; you see your own; admins see all
drop policy if exists "enquiries: insert" on public.enquiries;
create policy "enquiries: insert" on public.enquiries
  for insert with check (user_id is null or user_id = auth.uid());
drop policy if exists "enquiries: read own or admin" on public.enquiries;
create policy "enquiries: read own or admin" on public.enquiries
  for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "enquiries: admin delete" on public.enquiries;
create policy "enquiries: admin delete" on public.enquiries
  for delete using (public.is_admin());

-- wishlist: own rows only
drop policy if exists "wishlist: own" on public.wishlist_items;
create policy "wishlist: own" on public.wishlist_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- settings: everyone reads, admins update
drop policy if exists "settings: public read" on public.site_settings;
create policy "settings: public read" on public.site_settings for select using (true);
drop policy if exists "settings: admin update" on public.site_settings;
create policy "settings: admin update" on public.site_settings
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------- Image storage -------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product images: public read" on storage.objects;
create policy "product images: public read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product images: admin insert" on storage.objects;
create policy "product images: admin insert" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product images: admin update" on storage.objects;
create policy "product images: admin update" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product images: admin delete" on storage.objects;
create policy "product images: admin delete" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());
