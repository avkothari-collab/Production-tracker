-- ============================================================
-- PRODUCTION DPR & WIP CONTROL — PATCH V4 BACKDATED AUDIT
-- Run this after V3. Safe: adds audit/backdate columns only to production_* tables.
-- Keeps all tables separate from Merch Tracker.
-- ============================================================

alter table public.production_entries add column if not exists old_qty numeric;
alter table public.production_entries add column if not exists new_qty numeric;
alter table public.production_entries add column if not exists entry_source text default 'manual';
alter table public.production_entries add column if not exists validation_scope text default 'size_wise_as_of_entry_date';
alter table public.production_entries add column if not exists is_backdated boolean not null default false;
alter table public.production_entries add column if not exists backdate_reason text;
alter table public.production_entries add column if not exists approval_status text not null default 'not_required';
alter table public.production_entries add column if not exists approved_by uuid references auth.users(id) on delete set null;
alter table public.production_entries add column if not exists approved_at timestamptz;
alter table public.production_entries add column if not exists validation_snapshot jsonb not null default '{}'::jsonb;

create index if not exists idx_production_entries_backdated on public.production_entries(is_backdated, entry_date, created_at);
create index if not exists idx_production_entries_approval on public.production_entries(approval_status, entry_date);

comment on column public.production_entries.entry_date is 'Operational date of the production/procurement/WIP transaction. Balance checks must be done as of this date.';
comment on column public.production_entries.created_at is 'Actual audit timestamp when the entry was created in the system.';
comment on column public.production_entries.is_backdated is 'True when entry_date is before created_at::date.';
comment on column public.production_entries.backdate_reason is 'Reason required for backdated entries.';
comment on column public.production_entries.validation_snapshot is 'Stores old/new qty, source, approval status, and future as-of-date validation details.';

-- Future production material issue ledger for fabric/trims issued into production.
-- This is not a full procurement module; it is the production-facing material movement/audit hook.
create table if not exists public.production_material_movements (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null default current_date,
  material_type text not null default 'trim',
  item_name text not null,
  order_no text,
  style_no text,
  colour text default '',
  component text default '',
  size text,
  transaction_type text not null check (transaction_type in ('opening_stock','procurement_inward','store_issue','department_receive','return_to_store','consumption','adjustment')),
  qty numeric not null default 0,
  from_location text,
  to_location text,
  department text,
  party_name text,
  challan_no text,
  reason_code text,
  remarks text,
  is_backdated boolean not null default false,
  backdate_reason text,
  approval_status text not null default 'not_required',
  validation_snapshot jsonb not null default '{}'::jsonb,
  entered_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_production_material_movements_updated_at on public.production_material_movements;
create trigger trg_production_material_movements_updated_at before update on public.production_material_movements for each row execute function public.set_updated_at();

create index if not exists idx_production_material_movements_key on public.production_material_movements(order_no, style_no, colour, component, item_name);
create index if not exists idx_production_material_movements_date on public.production_material_movements(entry_date, transaction_type, department);

alter table public.production_material_movements enable row level security;

drop policy if exists "dev authenticated read production_material_movements" on public.production_material_movements;
drop policy if exists "dev authenticated write production_material_movements" on public.production_material_movements;
create policy "dev authenticated read production_material_movements" on public.production_material_movements for select to authenticated using (true);
create policy "dev authenticated write production_material_movements" on public.production_material_movements for all to authenticated using (true) with check (true);

-- ERP rule to preserve: any stock/WIP/procurement backdated entry must validate available qty as of entry_date,
-- then recalculate forward. Created_at is audit time; entry_date is operational time.
