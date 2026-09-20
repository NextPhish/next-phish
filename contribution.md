# Contributing

## Branching strategy

Create a branch from an up-to-date `main` before changing code. Use lowercase kebab-case names with a purpose prefix:

| Purpose                   | Pattern                  | Example                        |
| ------------------------- | ------------------------ | ------------------------------ |
| Feature or UI enhancement | `feature/<description>`  | `feature/sticky-table-actions` |
| Bug fix                   | `fix/<description>`      | `fix/schedule-timezone`        |
| Refactoring               | `refactor/<description>` | `refactor/campaign-components` |
| Documentation             | `docs/<description>`     | `docs/local-setup`             |
| Maintenance               | `chore/<description>`    | `chore/update-dependencies`    |

Keep each branch focused on one reviewable change. Open pull requests against `main`. Never push to a remote unless the user explicitly requests it; a request to edit or commit does not authorize a push.

## Project conventions

- Use pnpm and the workspace scripts from the repository root.
- Read [architecture](docs/architecture.md), [coding standards](docs/coding-standards.md), and [brand guidelines](docs/brand.md) before changing their respective areas.
- Read the relevant guide in the installed `apps/next-app/node_modules/next/dist/docs/` before changing Next.js code. Follow the installed version's APIs and deprecation notices.
- Keep pages server-first; use client components for interactive behavior. Follow the documented dynamic rendering and loading-state rules for database-backed routes.
- Use tRPC and React Query for client data access, Formik and shared Zod schemas for forms, and existing semantic state hooks for status and complex transitions.
- Follow the [frontend component conventions](docs/coding-standards.md#frontend-component-structure): a named main component with private `parts/`, owned `hooks/`, and shared local `types/` where needed. Use public entries across components; avoid `Container`/`Presentation` names in new and migrated code.
- Keep reusable UI in `@next-phish/ui` independent of Next.js, authentication, and backend code. Preserve permission checks and mutation behavior in application components.
- Use the shared table and `RowActionsMenu` for row actions. Put the non-sortable `actions` column last so its header and cells remain fixed at the right edge during horizontal scrolling. Keep translated accessible labels, disabled states, and destructive-action confirmations.
- Prefer Tailwind for application layout and ordinary component styling. Colocate exceptional scoped styles with their owner; use CSS modules for cases such as third-party editor selectors or complex animations. Reuse shared components instead of duplicating layout CSS.
- Write contribution documentation in English. Maintain English and Bulgarian translations for user-facing application changes.

## Validation and commits

Run checks appropriate to the changed packages, for example:

```sh
pnpm --filter @next-phish/ui test
pnpm --filter @next-phish/ui typecheck
pnpm --filter @next-phish/next-app typecheck
pnpm --filter @next-phish/ui lint
pnpm --filter @next-phish/next-app lint
npx react-doctor@latest --no-telemetry
```

Run React Doctor before committing React component changes. Verify interactive UI behavior, keyboard access, and responsive layouts; static type checks alone cannot verify scrolling or menu placement. Format changed files with Prettier and avoid unrelated formatting changes.

Use Conventional Commits with the configured types: `feat`, `fix`, `refactor`, `test`, `docs`, or `chore`. For example: `feat(ui): keep table actions visible while scrolling`. The pre-commit hook runs lint-staged; the commit-message hook runs commitlint. Do not bypass these checks. Describe the problem, resulting behavior, validation, and any remaining limitations in the pull request.
