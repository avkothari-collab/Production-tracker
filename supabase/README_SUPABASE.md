# Production DPR Supabase Reference

Run `production_schema.sql` in Supabase SQL Editor.

Development mode policies allow authenticated users to read/write all production tables.
Before production use, replace policies with role/department checks from `production_user_permissions`.

Future ERP links:
- `production_file_id` links to Merch Tracker production file release.
- `bom_id` links to Costing/BOM.
- Material issue against departments should later be a Stores/Inventory ledger linked by order/style/colour/component/size.
- Production should own DPR/WIP movement only, not BOM or procurement truth.
