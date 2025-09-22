# Architecture (excerpt)

## Data access pattern

- **Reads/CRUD**: Prefer Server Components / Server Actions. Use the shared Supabase client where appropriate.
- **Uploads**: Client-side to Supabase Storage (private bucket) with RLS protection and short-lived signed URLs.
- **Supabase client**:
  - `src/lib/supabase.ts` — initializes a Supabase JS client using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **File naming**: `user/<uid>/mem_<memoryId>/<timestamp>_<safe_name>`; sanitize to ASCII lowercase `[a-z0-9._-]`.
