RPC ORDERS v12 — GITHUB UPLOAD
==============================

This package is flat: there are no folders inside the ZIP.

Before upload:
1. Extract the ZIP into a new folder.
2. Copy your currently working Supabase URL and sb_publishable key into the new auth-config.js.
3. Do not copy any sb_secret, service_role, Resend, Google, or Discord secret into website files.
4. Run SUPABASE_ACCOUNT_SETUP.sql in Supabase SQL Editor.
5. Configure Google/Discord using AUTH_SETUP.txt.

GitHub:
1. Repository -> Add file -> Upload files.
2. Select all extracted files, not the ZIP itself.
3. Upload them to the repository root.
4. Commit changes.
5. Wait for Render deployment.

Main new files/features:
- auth.js v2.0.0
- separate Sign in / Register interface
- personal account cabinet
- nickname editor
- avatar upload through Supabase Storage
- Google and Discord OAuth sign-in/linking
- SUPABASE_ACCOUNT_SETUP.sql
- AUTH_SETUP.txt

Production verification:
1. Open https://rpc-order-website.onrender.com/
2. Ctrl+F5.
3. Console: window.RPC_AUTH.version
4. Expected: "2.0.0"
