# Production DPR & WIP Control

Separate Vercel-ready React app for the Production module, designed to later plug into the bigger ERP next to Merch Tracker.

## What is included

- Merch Tracker style paper UI
- Supabase client setup
- Supabase SQL schema and RLS development policies
- Dashboard
- Live WIP Status
- DPR Entry ledger screen
- Issued / Not Received
- Reconcile Center
- Department Aging
- Closure Control
- Reports / Excel export
- Future ERP reference fields: production_file_id, bom_id, shared order/style/colour/component keys

## Install

```bash
npm install
npm run dev
```

## Supabase setup

1. Create a Supabase project or use the ERP Supabase project.
2. Open Supabase SQL Editor.
3. Run `supabase/production_schema.sql`.
4. Copy `.env.example` to `.env.local`.
5. Add:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

6. Restart dev server.
7. In the app, click **Seed Supabase** to save the current demo production rows.

## Vercel deploy

1. Push this folder to GitHub.
2. Import the GitHub repo into Vercel.
3. Add environment variables in Vercel Project Settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy.

## Current limitation

This is v1 shell + Supabase foundation. It does not yet import the full Excel workbook automatically. The SQL and UI are structured so we can map your Production Master Excel into `production_orders` and `production_entries` next.
