create extension if not exists pgcrypto;
create extension if not exists citext;

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  category text not null,
  description text,
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.income (
  id uuid primary key default gen_random_uuid(),
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  description text,
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index if not exists expenses_month_idx on public.expenses (month);
create index if not exists expenses_date_idx on public.expenses (date desc);
create index if not exists income_month_idx on public.income (month);

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email citext unique,
  pin_hash text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.app_users
add column if not exists pin_hash text;

alter table public.app_users
alter column email drop not null;

create index if not exists app_users_email_idx on public.app_users (email);
create unique index if not exists app_users_pin_hash_idx on public.app_users (pin_hash) where pin_hash is not null;

alter table public.expenses disable row level security;
alter table public.income disable row level security;
alter table public.app_users disable row level security;
