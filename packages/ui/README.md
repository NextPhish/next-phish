# NextPhish UI — V1 foundation

The selected V1 design is now a React component library. The original application still uses PrimeReact; this package is the independently reviewable foundation for gradual migration. Tracking: [issue #23](https://github.com/MartinAndreev/next-phish/issues/23).

## Run

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm storybook
pnpm storybook:build
pnpm --filter @next-phish/ui typecheck
pnpm --filter @next-phish/ui lint
pnpm --filter @next-phish/ui test
```

Storybook runs at http://localhost:6006 and builds to `packages/ui/dist/storybook`. It needs no database, Redis, authentication or application server. Development uses Node 24. Storybook includes Autodocs, controls, accessibility scans and explicit 390px/820px viewport options. The Mobile workspace story selects 390px automatically.

## Available components

| Level     | Components                                                                                   | Important states                                                                                                             |
| --------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Atoms     | Button, ButtonLink, Badge, Input, Textarea, NativeSelect, Radix Select, Checkbox, Skeleton   | Variants, disabled, loading, invalid, required, mixed checkbox                                                               |
| Molecules | FormField, FormMessage, FormErrorSummary, Autocomplete, MultiSelect, FileUploader, FilterBar | Hint/error associations, field error links, server failure, success, search, no options, selected tags, upload failure/retry |
| Molecules | Card/Header/Body/Footer, MetricCard, PageHeader, EmptyState, Tabs, Dialog                    | Composition slots, focus restoration, keyboard tabs, scrollable dialogs                                                      |
| Organisms | DataTable                                                                                    | Populated, empty, no results, loading, error, combined filters, server-controlled state                                      |
| Templates | AppShell                                                                                     | Desktop sidebar, mobile Radix drawer, navigation descriptors, slots for organization/profile/actions                         |

The Workspace story composes real library components using sample campaign data. Its chart is an illustrative SVG, not a new chart engine. The organization form story uses Formik and the existing `createOrganizationSchema` from `@next-phish/shared`; submission is simulated. No stories send files, campaigns or messages to the backend.

## Styling and boundaries

- V1 tokens live in `src/styles.css`: light workspace, white surfaces, dark sidebar, indigo action color. Muted text is slightly darker than the HTML prototype to pass AA contrast on the workspace background.
- Component selectors use the `np-` prefix. Wrap the UI in `.np-theme` and import the stylesheet once. Dialog/Select/Popover portals apply their own theme wrapper. Tokens can be overridden on `.np-theme`.
- Tailwind v4 utilities are built by the consumer; no Tailwind Preflight is imported. The existing PrimeReact palette is not overwritten. Utility theme layers still need deliberate ordering when integrating into the current application's CSS.
- Pure UI has no Next.js, tRPC, auth or database dependency. Formik and shared schemas are story-only development dependencies. React is a peer dependency.
- The package exports TypeScript source, preserving `use client` at interactive boundaries. The consuming Next.js app should add `@next-phish/ui` to `transpilePackages` and the dependency to its manifest before adoption. Importing callbacks/column render functions still requires a client adapter.

```tsx
import { Button, FormField, Input } from "@next-phish/ui";
import "@next-phish/ui/styles.css";

<div className="np-theme">
  <FormField label="Name" hint="Visible to your team" error={error}>
    {(accessibility) => <Input {...fieldProps} {...accessibility} />}
  </FormField>
  <Button type="submit" loading={isSubmitting}>
    Save
  </Button>
</div>;
```

`FormField` owns the label, ID, description and error association. Its render prop supports both native controls and Radix Select/Autocomplete/MultiSelect. Form state, validation, translations, API errors and persistence remain in application containers. `FormErrorSummary` links to explicit field IDs. Provide translated labels through component props.

## Selection controls

- `Select`: Radix selection/typeahead/focus management; options have non-empty stable values. Empty string represents the placeholder. A disabled option remains unavailable. Use `NativeSelect` where a native picker is preferable.
- `Autocomplete`: Downshift `useCombobox` manages keyboard and ARIA. `value` is the selected option ID, `onValueChange` commits it. `onSearchChange` and `filterMode="server"` allow the app hook to debounce and fetch suggestions. Keep the selected option in `options` so its label remains available. This is selection from suggestions, not a free-text entry field. The suggestion list stays inside the component; avoid clipping overflow on its ancestors.
- `MultiSelect`: searchable Radix popover containing labeled checkboxes. Tab/Space navigate and toggle options; selected values render removable chips. Disabled options cannot be changed or cleared. Empty array is the empty value. Validate `required` with the form schema.

## DataTable contract

Uses TanStack Table **v8** (`^8.21.3`) deliberately for this initial API; a later major upgrade should be reviewed explicitly, not silently resolve to v9. It renders a semantic table with sortable header buttons and a keyboard-focusable horizontal scroll region. It is not an editable spreadsheet grid.

`useDataTableState` owns one reducer state: pagination, sorting, search and filters. Filtering/search/sorting reset page index. Client mode processes the full dataset. **Server mode receives one already processed page and a total**; no local re-sorting/filtering/slicing occurs. Wire state to the app's existing tRPC query and handle query loading/errors there.

```tsx
const model = useDataTableState();
<DataTable
  {...model}
  mode="server"
  data={result.rows}
  total={result.total}
  columns={columns}
  getRowId={(row) => row.id}
  caption="Campaigns"
  filters={[
    {
      field: "status",
      label: "Status",
      type: "select",
      options: statusOptions,
    },
    { field: "name", label: "Name", type: "text" },
  ]}
/>;
```

Filter fields must match column IDs/accessor keys, including nested column groups. Text means case-insensitive substring, select/date mean exact string, numeric means exact number (including zero). Date values use `YYYY-MM-DD`; server adapters must map dates to their API semantics. Column-specific `filterFn` overrides defaults. Use **Add filter** to choose a field, then its control appears as a removable filter. Select filters and pagination use the custom Radix Select. A field can be added only once; removing it makes it available again. Filters combine with AND; global search also applies. Clear filters preserves search; the no-results reset clears both.

The caller reconciles page index after deletion, dataset/organization replacement or a smaller server total, and supplies stable row IDs. Range filters, saved views, column resizing/pinning/virtualization, row selection and action menus are not implemented in this first slice. Preserve the existing `AppDataTable` until the app adapter covers its action visibility, translations and API callback mapping. This exported DataTable is not a drop-in replacement yet.

## Files

`FileUploader` accepts controlled `files`/`onFilesChange` and optional async `onUpload`. It supports keyboard file selection, drag/drop, deduplication, extension/MIME filtering, size/count limits, removal, busy state, success and failure with retry. Accepted files stay selected after a failed upload. The component makes no HTTP calls itself. The caller's upload adapter owns authentication, storage, cancellation/progress if needed and authoritative server validation. Client checks are usability checks, not a security boundary. Per-file progress and resumable upload are future additions.

## Migration order

1. Confirm this Storybook foundation and the remaining detailed control requirements.
2. Adapt the existing Formik FormField/FormMessage and add page-scoped V1 styling.
3. Build an app-specific table adapter preserving `onSearch`, multi-sort `onSort`, `onFilter` and one-based `onPage` callbacks. TanStack pageIndex is zero-based. Add existing row action permissions and date filter mapping before replacing tables.
4. Migrate one list and one form against real tRPC data, including loading/error/empty states and organization changes.
5. Integrate AppShell navigation with Next Link, current-route matching, translated labels and existing organization/account controls.
6. Migrate remaining pages, editor shells and specialized controls gradually; remove PrimeReact only when usages are gone.

See `docs/ui-library-plan.md` for the current-component audit and `docs/plugin-system-proposal.md` for the separate plugin proposal.

## Sources

[Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction), [TanStack v8 pagination](https://tanstack.com/table/v8/docs/guide/pagination), [Downshift useCombobox](https://www.downshift-js.com/use-combobox/), [Storybook React/Vite](https://storybook.js.org/docs/get-started/frameworks/react-vite). Installed Next.js docs for `use client` and `transpilePackages` were reviewed for the future app boundary.

### List loading

`DataTable` renders skeleton cells for the current page size while `loading` is true. `Select`, `Autocomplete` and `MultiSelect` use the shared `SkeletonList` for pending options via `loading` and optional `loadingLabel`. Loading placeholders are not selectable; existing selection remains controlled by the caller. Status text is available to screen readers and skeleton animation respects reduced-motion preferences.
