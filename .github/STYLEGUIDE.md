# Styleguide

## Imports

- Use path aliases `@/*` (mapped to `src/*`)
- Avoid deep relative paths (`../../`)

## UI Components

- `<Button>` is polymorphic:
  - Supports `<button>` and Next `<Link>` (`asChild`/polymorphic prop).
  - Default `type="button"`.
  - Visual/ARIA state via `isDisabled` (internally applies `disabled`, `aria-disabled`, styles).
- Keep variants minimal (e.g., `primary`, `secondary`); use `cn()` helper for conditional classes.

## TypeScript

- Avoid `any`; define interfaces/types for props.
- Keep functions small and pure where possible.
