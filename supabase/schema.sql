create extension if not exists pgcrypto;
create extension if not exists citext;

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

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  date date not null,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  category text not null,
  description text,
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  description text,
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

alter table public.expenses
add column if not exists user_id uuid references public.app_users(id) on delete cascade;

alter table public.income
add column if not exists user_id uuid references public.app_users(id) on delete cascade;

create table if not exists public.login_rate_limits (
  scope_key text primary key,
  attempts integer not null default 0,
  window_started_at timestamptz not null default now(),
  blocked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expenses_month_idx on public.expenses (month);
create index if not exists expenses_user_month_idx on public.expenses (user_id, month);
create index if not exists expenses_date_idx on public.expenses (date desc);
create index if not exists income_month_idx on public.income (month);
create index if not exists income_user_month_idx on public.income (user_id, month);
create index if not exists login_rate_limits_blocked_until_idx on public.login_rate_limits (blocked_until);

alter table public.expenses enable row level security;
alter table public.income enable row level security;
alter table public.app_users enable row level security;
alter table public.login_rate_limits enable row level security;

drop policy if exists "deny_all_expenses" on public.expenses;
create policy "deny_all_expenses"
on public.expenses
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "deny_all_income" on public.income;
create policy "deny_all_income"
on public.income
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "deny_all_app_users" on public.app_users;
create policy "deny_all_app_users"
on public.app_users
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "deny_all_login_rate_limits" on public.login_rate_limits;
create policy "deny_all_login_rate_limits"
on public.login_rate_limits
as restrictive
for all
to anon, authenticated
using (false)
with check (false);
