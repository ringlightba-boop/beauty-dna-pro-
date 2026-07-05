-- ---------------------------------------------------------------------------
-- Beauty DNA Pro AI — Supabase schema
-- ---------------------------------------------------------------------------
-- This mirrors the tables the MVP's mock data layer (lib/db.ts) already uses
-- in memory/JSON. When you're ready to go live:
--   1. Run this file against a new Supabase project.
--   2. Reimplement the functions in lib/db.ts using `@supabase/supabase-js`
--      (or `@supabase/ssr` for server components) — the function signatures
--      can stay the same, so no page/component needs to change.
--   3. Move photo uploads from base64 data URLs to Supabase Storage buckets
--      (see the `diagnostic-photos` bucket note at the bottom).
--   4. Swap lib/auth.ts's cookie session for Supabase Auth
--      (supabase.auth.signUp / signInWithPassword), keeping `profiles.user_id`
--      as the foreign key to `auth.users.id`.
-- ---------------------------------------------------------------------------

create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  professional_name text not null,
  email text not null unique,
  whatsapp text not null,
  city text not null,
  state text not null,
  instagram text,
  brand_name text,
  brand_color text,
  logo_url text,
  default_message text not null default '',
  slug text not null unique,
  credits_available integer not null default 3,
  free_credits_used integer not null default 0,
  plan_type text not null default 'free' check (plan_type in ('free','credits','unlimited')),
  plan_status text not null default 'active' check (plan_status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  whatsapp text not null,
  email text,
  age integer,
  city text,
  instagram text,
  created_at timestamptz not null default now()
);

create table if not exists diagnostics (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references profiles (id) on delete cascade,
  client_id uuid not null references clients (id) on delete cascade,
  status text not null default 'aguardando_cliente' check (status in ('aguardando_cliente','concluido','cancelado')),
  service_type text check (service_type in ('maquiagem','penteado','maquiagem_penteado','nao_sei')),
  occasion text,
  desired_image text,
  appointment_date timestamptz,
  consent_accepted boolean not null default false,
  photo_front_url text,
  photo_side_url text,
  makeup_reference_url text,
  hair_reference_url text,
  outfit_reference_url text,
  answers_json jsonb,
  result_json jsonb,
  edited_result_json jsonb,
  whatsapp_summary text,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists credit_transactions (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references profiles (id) on delete cascade,
  transaction_type text not null check (transaction_type in ('grant_free','purchase','consume','refund')),
  amount integer not null,
  description text not null default '',
  diagnostic_id uuid references diagnostics (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists packages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  credits integer not null,
  price numeric(10,2) not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists payment_orders (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references profiles (id) on delete cascade,
  package_id uuid not null references packages (id),
  provider text not null default 'mercado_pago',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  amount numeric(10,2) not null,
  credits integer not null,
  checkout_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security — every professional only sees her own data.
-- The public client flow (/d/[slug]) should use a Supabase service role (or
-- a narrowly-scoped RPC) since clients are never authenticated Supabase users.
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table clients enable row level security;
alter table diagnostics enable row level security;
alter table credit_transactions enable row level security;
alter table payment_orders enable row level security;

create policy "Professionals manage their own profile"
  on profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Professionals see their own clients"
  on clients for all
  using (professional_id in (select id from profiles where user_id = auth.uid()));

create policy "Professionals see their own diagnostics"
  on diagnostics for all
  using (professional_id in (select id from profiles where user_id = auth.uid()));

create policy "Professionals see their own transactions"
  on credit_transactions for select
  using (professional_id in (select id from profiles where user_id = auth.uid()));

create policy "Professionals see their own payment orders"
  on payment_orders for select
  using (professional_id in (select id from profiles where user_id = auth.uid()));

-- Packages are public read-only reference data.
alter table packages enable row level security;
create policy "Anyone can read active packages"
  on packages for select
  using (active = true);

insert into packages (name, credits, price, active) values
  ('Essencial', 10, 29.90, true),
  ('Profissional', 30, 59.90, true),
  ('Studio', 100, 127.00, true)
on conflict do nothing;

-- Storage bucket for client photos (run once):
-- select storage.create_bucket('diagnostic-photos', public := false);
-- Then serve photos via signed URLs scoped to the owning professional.
