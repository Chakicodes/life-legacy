# Styleguide

## Imports

- Use path aliases `@/*` (mapped to `src/*`)
- Avoid deep relative paths (`../../`)

## UI Components

- `<Button>` is polymorphic:
  - Renders a real `<button>` by default; when `href` is provided, renders a Next `<Link>`.
  - Default `type="button"`.
  - Visual/ARIA state via `isDisabled` (prevents navigation on links, applies `disabled` and `aria-disabled` semantics).
- Keep variants minimal (e.g., `primary`, `secondary`); use `cn()` helper for conditional classes.

## TypeScript

- Avoid `any`; define interfaces/types for props.
- Keep functions small and pure where possible.
