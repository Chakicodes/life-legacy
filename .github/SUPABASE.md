# Supabase Setup (template)

This document captures the minimum setup for local/preview/prod.

## Env vars

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database (Postgres)

- Tables: `memories` (id, user_id, title, body, created_at)
- RLS: enabled on all tables
- Policies: allow access only to `auth.uid()` matches `user_id`

Example policy (pseudo-SQL):

```sql
alter table memories enable row level security;
create policy "Memories are only visible to owners"
  on memories for select
  using ( auth.uid() = user_id );
create policy "Owners can insert"
  on memories for insert
  with check ( auth.uid() = user_id );
```

## Storage

- Bucket: `memories` (private)
- Path convention: `user/<uid>/mem_<memoryId>/<timestamp>_<safe_name>`
- Signed URLs: short TTL, generated on demand for client access

## Notes

- Client uploads must use sanitized filenames (see `src/lib/filename.ts`).
- Prefer Server Components/Actions for reads and mutations where possible.
