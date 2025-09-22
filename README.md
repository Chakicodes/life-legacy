This is a [Next.js](https://nextjs.org) app configured for cross‑platform development (Windows + macOS).

## Prerequisites

- Node: `22.x` (see `.nvmrc`)
- Package manager: `npm` (default). `corepack` is enabled, so `pnpm` can be activated if desired.
- Env vars: see `.env.local.example`

## Setup (Windows and macOS)

1. Node 22 with fnm

- Install fnm:
  - Windows (PowerShell): `winget install -e Schniz.fnm`
  - macOS (Homebrew): `brew install fnm`
- Initialize fnm in your shell (PowerShell/zsh/bash) and then:
  ```sh
  fnm install 22
  fnm use 22
  ```
  fnm will auto‑activate via `.nvmrc`.

2. Env vars

- Copy example and fill values:
  ```sh
  cp .env.local.example .env.local   # macOS/Linux
  # Windows PowerShell
  # Copy-Item .env.local.example .env.local -Force
  ```
  Provide your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

3. Install and run

```sh
npm install
npm run dev
```

Open http://localhost:3000

4. Build and validate

```sh
npm run -s lint
npm run -s typecheck
npm run -s build
```

## MCP servers (optional)

This workspace includes `.vscode/mcp.json` for:

- Filesystem server: `@modelcontextprotocol/server-filesystem` (via `npx`)
- Git server: `mcp-server-git` (via `uvx`)

Install `uv`/`uvx` if needed:

- Windows (PowerShell): `irm https://astral.sh/uv/install.ps1 | iex`
- macOS (Homebrew): `brew install uv`

Reload VS Code window so PATH changes apply.

## Troubleshooting

- Missing env vars during build: ensure `.env.local` is filled (see `.env.local.example`).
- Windows EPERM on `node_modules`: stop Node processes, rename `node_modules`, and reinstall.
- Next.js root warning: `next.config.ts` sets `turbopack.root` to project root.

## Docs

- Architecture: `.github/ARCHITECTURE.md`
- Styleguide: `.github/STYLEGUIDE.md`
- Copilot Instructions: `.github/copilot-instructions.md`
- Supabase Setup (template): `.github/SUPABASE.md`
