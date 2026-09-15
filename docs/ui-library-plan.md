# V1 component library

Selected direction: V1 from the static prototypes in `next-phish-redesign/v1`. Implementation starts in `packages/ui`, on branch `codex/v1-component-library`, tracked in [issue #23](https://github.com/MartinAndreev/next-phish/issues/23). This delivers the foundation and Storybook, not a completed application migration.

## Review and component mapping

| Existing code / design                                             | Shared replacement                            | Responsibilities remaining in the application                        |
| ------------------------------------------------------------------ | --------------------------------------------- | -------------------------------------------------------------------- |
| V1 CSS tokens and repeated HTML card/field/button functions        | `.np-theme`, semantic tokens, atoms/molecules | Page composition and branding overrides                              |
| Direct PrimeReact Button/InputText/Dropdown/MultiSelect usage      | Button/Input/Select/Autocomplete/MultiSelect  | Formik field bindings, Zod, translations                             |
| `molecules/form-field.tsx`, `atoms/form-message.tsx`               | FormField, FormMessage, FormErrorSummary      | touched/errors/submit status in the container                        |
| `molecules/data-table/data-table.tsx` + FilterBar/useTableState    | DataTable, FilterBar, useDataTableState       | tRPC queries, debounce, organization/permissions, API mapping        |
| `molecules/file-uploader.tsx`                                      | FileUploader                                  | Actual uploads, auth, server validation, storage                     |
| `organisms/app-shell/*`                                            | AppShell + NavigationGroup descriptors        | Next Link/pathname, organization and profile, access control         |
| `organisms/dashboard/*`                                            | MetricCard, Card, PageHeader                  | Actual KPI definitions and chart data                                |
| `molecules/catalog-card.tsx`, editor, task/schedule-specific views | Next phase                                    | Preserve existing sandbox previews, editor and business interactions |

The initial set was expanded following feedback to include table filters, Radix Select, autocomplete, multiselect, file uploads and form error states. Controls have Storybook variants for disabled/invalid/empty states and interactions where applicable.

## Decisions

- `@next-phish/ui` is a separate React package with an Atomic Design structure; Storybook lives inside it and runs without a backend. The login screen is the first application consumer; other screens remain on the existing UI until reviewed individually.
- Radix manages Dialog/Tabs/Select/Checkbox/Popover. Autocomplete uses Downshift for combobox behavior. Tailwind v4 and scoped tokens handle styling.
- TanStack Table v8 is the explicit API baseline; the package range prevents an accidental v9 upgrade. Table filters cover the existing text/select/date/numeric categories, are added through "Add filter", and support individual removal and a shared reset. Value selection and page size use the custom Radix Select.
- Formik/Zod remain in place. The working form story uses the existing organization schema rather than introducing a parallel business validation model.
- NativeSelect is exported separately from the styled Radix Select. All controls have typed props; FormField provides error/hint associations.
- The muted color is slightly darker than HTML V1 following an accessibility check. Existing global brand/PrimeReact overrides remain in the application until migration proceeds page by page.

## First-phase boundary

The next practical step is an adapter for one table and one form. Before broad migration, cover existing row actions/permissions and translations, selection/bulk actions where needed, date semantics, upload progress/cancellation, and state reset when switching organizations or deleting the final row. Storybook examples run locally with demonstration data; they do not create campaigns or upload files.

For detailed APIs, commands and limitations, see [packages/ui/README.md](../packages/ui/README.md).

## Screen migration progress

The login route now uses V1 styling and shared Button, Input, FormField, FormMessage and Skeleton components. Password and magic-link authentication, translated copy, auth callback messages and the first-admin setup link retain the existing application logic. The initial setup screen now uses the same V1 direction, localized field validation, shared PasswordInput and AuthLayout components, and a matching skeleton. The first-user guard remains intact. Review the actual presentation through Screens/Initial setup in Storybook without creating an account. Further screens await user review.

The organization onboarding route now uses AuthLayout and V1 form controls, retaining organization access checks, editable auto-generated slugs and debounced availability checks. Review it under Screens/Create organization. System notification emails share a precompiled MJML master; see [email templates](../packages/backend/src/email/templates/README.md).
