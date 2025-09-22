# Architecture (excerpt)

## Data access pattern

- **Reads/CRUD**: Server Components / Server Actions call repo functions in `src/repo/*`.
- **Uploads**: client-side to Supabase Storage (private bucket) with RLS protection and short-lived signed URLs.
- **Supabase clients**:
  - `src/lib/supabaseClient.ts` — browser client (anon key).
  - `src/lib/supabaseServer.ts` — server client via `@supabase/ssr` + cookies (uses anon key; RLS enforces per-user access).
- **File naming**: `user/<uid>/mem_<memoryId>/<timestamp>_<safe_name>`; sanitize to ASCII lower `[a-z0-9._-]`.
