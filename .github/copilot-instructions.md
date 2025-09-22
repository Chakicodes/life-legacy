# Copilot Instructions — Life Legacy App

**Project Goal**  
Life Legacy — secure web app for recording personal memories (text + attachments) for private storage.  
V1 only = capture & view memories. Delivery-after-death flows come later.

**Tech Stack**

- Next.js 15 (App Router), TypeScript, TailwindCSS
- Supabase (Auth with email, Postgres + RLS, Storage private bucket `memories`)
- File naming: sanitize ASCII lowercase [a-z0-9._-], path: user/<uid>/mem*<memoryId>/<timestamp>*<safe_name>
- Storage access: signed URLs, short TTL.

**UI/UX**

- After sign-in → `/home` with top navbar.
- Two columns:
  - Left = Files panel (Photos 3×3, Videos 3×3, Documents 3×3, Audio list 10). Each has “See all” page.
  - Right = Feed, first element is “Create memory” card → opens modal (Title, Body, multi-file upload: images, videos, audio, pdf/doc/docx/xls/xlsx).
- New memory appears immediately in feed & files summaries.
- No public sharing in V1.

**Coding Style**

- Strong TypeScript, no `any`.
- Small, reusable components (`src/components`).
- Prefer server components & actions for CRUD; uploads via signed URLs.
- No extra libraries without reason.
- Keep migrations minimal, SQL changes explicit.
- Sanitize filenames strictly.
- Before giving code: summarize goal, list assumptions, propose minimal diffs (filenames + changed blocks), add quick test checklist.

**Conventions**

- Polymorphic `<Button>` supports `<button>`/`<a>/<Link>`; default `type="button"`, use `isDisabled` instead of `disabled` for visual+ARIA state.
- Path aliases: `@/*` → `src/*` (use absolute imports).
- Supabase usage:
  - Client uploads (signed, RLS-safe) live in client components.
  - Filename sanitization required for all uploads (ASCII `[a-z0-9._-]`, lowercase).

**Developer workflow**

- Commands: `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run ci`.

# Copilot Instructions

- Always follow the project’s coding style (TypeScript, React/Next.js, TailwindCSS).
- Use "@/..." aliases for imports from src.
- Keep code modular, clean and well-typed.
- For Supabase integration, use the existing client in `src/lib/supabase.ts`.

## Documentation Notes

- Always leave **short change notes** in code comments when implementing or modifying features.
- Change notes should include:
  - Which component/file was updated
  - What was changed (1–2 sentences max)
  - Which phase (e.g., V1 auth, V1 UI, File upload support, etc.)
- Example:
  ```ts
  // [CHANGE NOTE | V1 File Uploads] Updated ImageUploader.tsx to support PDF/DOCX in addition to images
  ```
