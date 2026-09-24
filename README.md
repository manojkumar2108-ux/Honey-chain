# HoneyTrace + Supabase

## Folder
- index.html  -> page structure
- style.css   -> all original CSS
- app.js      -> UI + Supabase Auth + database + QR verification
- supabase-config.js -> Supabase URL + publishable key
- supabase_schema.sql -> database tables, trigger and RLS policies

## Important
This is a prototype architecture. The `blockchain_hash` field is a SHA-256 hash generated in the browser and stored in Supabase. It is NOT a real public blockchain transaction.

For a real blockchain implementation, add a smart contract/network later and store its transaction hash in `honey_batches`.

## Quick setup
1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase_schema.sql`.
4. Open Project Settings / Connect and copy the Project URL and Publishable key.
5. Put them in `supabase-config.js`.
6. In Authentication settings, configure email confirmation as you prefer.
7. Run the site with VS Code Live Server or deploy the folder to GitHub Pages.
8. Register a Seller account.
9. Login as Seller.
10. Create a honey batch.
11. The batch is inserted into Supabase and a QR is generated.
12. Open the QR URL in another browser/incognito window to test public verification.

Never put a Supabase service_role/secret key in frontend JavaScript.
