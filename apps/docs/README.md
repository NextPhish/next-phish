# NextPhish Docs

Astro and Starlight power the standalone documentation site. English pages live in `src/content/docs/`; the custom home page lives in `src/pages/index.astro`.

From the repository root:

```sh
pnpm --filter @next-phish/docs dev
pnpm --filter @next-phish/docs build
```

The local preview runs on `http://localhost:4321`. Set `PUBLIC_APP_URL` to the public NextPhish application URL when building a deployed site to show the **Open app** link. During local development, the link defaults to `http://localhost:3000/`.

Starlight builds a static `dist/` directory, including search. Add future translations using Starlight locales and corresponding localized content folders.

## GitHub Pages

The [Documentation Pages workflow](../../.github/workflows/docs-pages.yml) checks the site on pull requests and publishes it after changes land on `main`. In the repository settings, select **GitHub Actions** as the Pages build and deployment source. The published address is `https://martinandreev.github.io/next-phish/`.

GitHub Pages hosts this repository below `/next-phish/`, so the workflow builds with `DOCS_BASE_PATH=/next-phish` and `DOCS_SITE_URL=https://martinandreev.github.io`. To check the same output locally, run:

```sh
DOCS_BASE_PATH=/next-phish DOCS_SITE_URL=https://martinandreev.github.io pnpm --filter @next-phish/docs build
```

The optional repository Actions variable `NEXTPHISH_APP_URL` sets the **Open app** destination. Leave it unset if the deployed application has no public address yet. The workflow can also be started manually from the Actions tab.
