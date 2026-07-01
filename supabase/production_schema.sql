-- ============================================================
-- PRODUCTION DPR & WIP CONTROL — SCHEMA V3
-- For: same Supabase project as Merch Tracker
-- Scope: creates only production_* tables + production indexes/policies
-- Safe to rerun: uses create table/index if not exists and drops only production dev policies/triggers
-- Note: this is development RLS; tighten before real users/business data.
-- V3 adds style photo URL support and keeps production_* tables separate from Merch Tracker.
-- ============================================================


create extension if not exists pgcrypto;

create table if not exists public.production_orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null,
  style_no text not null,
  buyer text,
  brand text,
  photo_url text,
  photo_thumb_url text,
  colour text not null default '',
  component text not null default '',
  set_id text,
  order_qty numeric not null default 0,
  size_set text not null default 'alpha',
  delivery_date date,
  production_file_id uuid,
  bom_id uuid,
  default_line text,
  route jsonb not null default '["cutting","printing","stitching","checking","iron","packing","dispatch"]'::jsonb,
  stage_qty jsonb not null default '{}'::jsonb,
  idle_by_stage jsonb not null default '{}'::jsonb,
  party_by_stage jsonb not null default '{}'::jsonb,
  reject_qty jsonb not null default '{}'::jsonb,
  alter_qty jsonb not null default '{}'::jsonb,
  missing_qty jsonb not null default '{}'::jsonb,
  status text default 'active',
  source text default 'production_app',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(order_no, style_no, colour, component)
);


-- Safe upgrade columns for projects that already ran V1/V2 schema.
alter table public.production_orders add column if not exists photo_url text;
alter table public.production_orders add column if not exists photo_thumb_url text;

create table if not exists public.production_order_sizes (
  id uuid primary key default gen_random_uuid(),
  production_order_id uuid references public.production_orders(id) on delete cascade,
  order_no text not null,
  style_no text not null,
  colour text not null default '',
  component text not null default '',
  size text not null,
  order_qty numeric not null default 0,
  cut_qty numeric not null default 0,
  packed_qty numeric not null default 0,
  created_at timestamptz not null default now(),
  unique(order_no, style_no, colour, component, size)
);

create table if not exists public.production_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null default current_date,
  order_no text not null,
  style_no text not null,
  buyer text,
  colour text not null default '',
  component text not null default '',
  size text,
  stage text not null,
  dept text not null,
  entry_type text not null check (entry_type in (
    'opening_wip','plan','issue','receive','good_output','reject','alter_issue','alter_receive','missing','return','rework','adjustment','closure','dispatch'
  )),
  qty numeric not null default 0,
  good_qty numeric not null default 0,
  reject_qty numeric not null default 0,
  alter_qty numeric not null default 0,
  missing_qty numeric not null default 0,
  from_department text,
  to_department text,
  line_no text,
  party_name text,
  challan_no text,
  defect_type text,
  reason_code text,
  remarks text,
  production_order_id uuid references public.production_orders(id) on delete set null,
  entered_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.production_daily_plan (
  id uuid primary key default gen_random_uuid(),
  plan_date date not null,
  order_no text not null,
  style_no text not null,
  colour text not null default '',
  component text not null default '',
  stage text not null,
  line_no text,
  planned_qty numeric not null default 0,
  planned_hours numeric not null default 8,
  target_efficiency numeric,
  smv numeric,
  plan_source text default 'weekly_rolling',
  remarks text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.production_department_closure (
  id uuid primary key default gen_random_uuid(),
  order_no text not null,
  style_no text not null,
  colour text not null default '',
  component text not null default '',
  stage text not null,
  closure_status text not null default 'pending' check (closure_status in ('open','pending_closure','needs_reconcile','closed_by_dept','verified_closed','force_closed')),
  good_qty numeric not null default 0,
  reject_qty numeric not null default 0,
  alter_balance numeric not null default 0,
  missing_qty numeric not null default 0,
  wip_balance numeric not null default 0,
  material_balance numeric not null default 0,
  remarks text,
  closed_by uuid references auth.users(id) on delete set null,
  verified_by uuid references auth.users(id) on delete set null,
  closed_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.production_adjustments (
  id uuid primary key default gen_random_uuid(),
  order_no text not null,
  style_no text not null,
  colour text not null default '',
  component text not null default '',
  stage text not null,
  old_qty numeric,
  new_qty numeric,
  difference numeric generated always as (coalesce(new_qty,0) - coalesce(old_qty,0)) stored,
  reason text not null,
  requested_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create table if not exists public.production_parties (
  id uuid primary key default gen_random_uuid(),
  party_name text not null unique,
  process_type text,
  contact_person text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.production_challans (
  id uuid primary key default gen_random_uuid(),
  challan_no text not null unique,
  challan_date date not null default current_date,
  party_name text,
  from_department text,
  to_department text,
  order_no text not null,
  style_no text not null,
  colour text not null default '',
  component text not null default '',
  issue_qty numeric not null default 0,
  receive_qty numeric not null default 0,
  pending_qty numeric generated always as (coalesce(issue_qty,0) - coalesce(receive_qty,0)) stored,
  status text default 'open',
  remarks text,
  created_at timestamptz not null default now()
);

create table if not exists public.production_user_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  can_view boolean not null default true,
  can_entry boolean not null default false,
  can_hod_closure boolean not null default false,
  can_approve_adjustment boolean not null default false,
  can_reports boolean not null default false,
  department_scope text[] default '{}',
  created_at timestamptz not null default now(),
  unique(user_id)
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_production_orders_updated_at on public.production_orders;
create trigger trg_production_orders_updated_at before update on public.production_orders for each row execute function public.set_updated_at();

drop trigger if exists trg_production_entries_updated_at on public.production_entries;
create trigger trg_production_entries_updated_at before update on public.production_entries for each row execute function public.set_updated_at();

create index if not exists idx_production_orders_key on public.production_orders(order_no, style_no, colour, component);
create index if not exists idx_production_entries_key on public.production_entries(order_no, style_no, colour, component);
create index if not exists idx_production_entries_date_stage on public.production_entries(entry_date, stage, entry_type);
create index if not exists idx_production_closure_key on public.production_department_closure(order_no, style_no, colour, component, stage);
create index if not exists idx_production_challans_key on public.production_challans(order_no, style_no, colour, component);
create unique index if not exists idx_production_daily_plan_unique
  on public.production_daily_plan(plan_date, order_no, style_no, colour, component, stage, (coalesce(line_no, '')));

-- Development RLS. Use authenticated login. Tighten later for role/department access.
alter table public.production_orders enable row level security;
alter table public.production_order_sizes enable row level security;
alter table public.production_entries enable row level security;
alter table public.production_daily_plan enable row level security;
alter table public.production_department_closure enable row level security;
alter table public.production_adjustments enable row level security;
alter table public.production_parties enable row level security;
alter table public.production_challans enable row level security;
alter table public.production_user_permissions enable row level security;

-- Drop existing dev policies if rerunning.
do $$
declare r record;
begin
  for r in select schemaname, tablename, policyname from pg_policies where schemaname='public' and policyname like 'dev authenticated %' loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

create policy "dev authenticated read production_orders" on public.production_orders for select to authenticated using (true);
create policy "dev authenticated write production_orders" on public.production_orders for all to authenticated using (true) with check (true);
create policy "dev authenticated read production_order_sizes" on public.production_order_sizes for select to authenticated using (true);
create policy "dev authenticated write production_order_sizes" on public.production_order_sizes for all to authenticated using (true) with check (true);
create policy "dev authenticated read production_entries" on public.production_entries for select to authenticated using (true);
create policy "dev authenticated write production_entries" on public.production_entries for all to authenticated using (true) with check (true);
create policy "dev authenticated read production_daily_plan" on public.production_daily_plan for select to authenticated using (true);
create policy "dev authenticated write production_daily_plan" on public.production_daily_plan for all to authenticated using (true) with check (true);
create policy "dev authenticated read production_department_closure" on public.production_department_closure for select to authenticated using (true);
create policy "dev authenticated write production_department_closure" on public.production_department_closure for all to authenticated using (true) with check (true);
create policy "dev authenticated read production_adjustments" on public.production_adjustments for select to authenticated using (true);
create policy "dev authenticated write production_adjustments" on public.production_adjustments for all to authenticated using (true) with check (true);
create policy "dev authenticated read production_parties" on public.production_parties for select to authenticated using (true);
create policy "dev authenticated write production_parties" on public.production_parties for all to authenticated using (true) with check (true);
create policy "dev authenticated read production_challans" on public.production_challans for select to authenticated using (true);
create policy "dev authenticated write production_challans" on public.production_challans for all to authenticated using (true) with check (true);
create policy "dev authenticated read production_user_permissions" on public.production_user_permissions for select to authenticated using (true);
create policy "dev authenticated write production_user_permissions" on public.production_user_permissions for all to authenticated using (true) with check (true);

-- Future integration note:
-- production_orders.production_file_id should link to Merch Tracker production file release.
-- production_orders.bom_id should link to Costing/BOM.
-- production_entries is the truth ledger for DPR, issue/receive, reject, alter, missing, dispatch.
