# Production DPR & WIP Control — V4

Separate Vercel-ready React app for the Production module, designed to later plug into the bigger ERP next to Merch Tracker.

## What is included

- Merch Tracker style paper UI
- Supabase client setup
- Style-wise print / embroidery route toggles
- Live WIP with simple department cells: Done / Open / R-A-M
- Editable WIP cell: click department cell, edit size-wise cumulative values, save as ledger entry
- Horizontal size-wise DPR quick entry
- Entry date selector and backdated-entry audit
- Backdated reason required for older entries
- Downstream total-jump block after cutting
- Cutting over allowed with warning/tolerance
- Owner chase with 95% receiving rule adding Production Coordinator
- Daily printable department-head WIP sheet
- Excel exports, with xlsx loaded only when export is clicked
- Style photo URL support with lazy-loaded thumbnails for slow internet
- ERP-ready reference fields for future Style Master / BOM / Procurement / Merch Tracker linking

## Supabase setup

If this is a fresh project, run:

```sql
supabase/production_schema.sql
```

If you already ran V3, run only:

```sql
supabase/production_schema_patch_v4_backdated_audit.sql
```

This patch keeps all objects in `production_*` tables and does not touch Merch Tracker tables.

## Backdated ERP rule

Every transaction has two dates:

- `entry_date` = operational date used for WIP/stock/production logic
- `created_at` = actual system audit timestamp

Future procurement/stores/production stock logic must validate available quantity as of `entry_date`, not today's balance, then recalculate forward.

## Vercel env variables

Use the same Supabase project as Merch Tracker, but separate production tables:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_publishable_key
```
