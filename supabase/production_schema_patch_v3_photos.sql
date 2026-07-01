-- ============================================================
-- PRODUCTION DPR & WIP CONTROL — PATCH V3 STYLE PHOTOS
-- Run this if you already ran the earlier production schema.
-- Safe: adds only optional photo columns to production_orders.
-- ============================================================

alter table public.production_orders add column if not exists photo_url text;
alter table public.production_orders add column if not exists photo_thumb_url text;

comment on column public.production_orders.photo_url is 'Optional optimized style photo URL for WIP/detail views. Use compressed thumbnail URLs for speed.';
comment on column public.production_orders.photo_thumb_url is 'Optional separate thumbnail URL for future Supabase Storage optimization.';
