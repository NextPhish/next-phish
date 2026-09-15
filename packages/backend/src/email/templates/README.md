# System email templates

System notifications use one V1 master, `master.mjml`, and six MJML content fragments. The master owns the header, typography, colors, spacing, action-button defaults, footer and wrapping for long fallback URLs. Campaign email templates remain user-authored and are not changed by this renderer.

## Build and review

From the repository root:

```sh
pnpm --filter @next-phish/backend emails:build
pnpm --filter @next-phish/backend emails:check
node packages/backend/scripts/build-emails.mjs --preview /tmp/next-phish-email-preview
python3 -m http.server 3101 --bind 127.0.0.1 --directory /tmp/next-phish-email-preview
```

Open `http://localhost:3101/` for all six previews. Preview data uses example.com and dummy codes; generating previews sends no email.

MJML is a development dependency. The compiler validates every template in strict mode and writes `compiled.ts`, which must be committed with source changes. CI rejects stale output. The application imports this file and inserts escaped EJS values at runtime, preserving the synchronous `renderTemplate(name, locals)` API. Runtime rendering does not load template files or invoke MJML, so no template filesystem lookup or MJML runtime dependency is needed in Next.js or the worker.

The compiler uses inert placeholders while generating HTML, then replaces them with escaped EJS expressions. Do not insert unescaped user data or raw HTML. The only unescaped source slot is the trusted MJML body fragment in the master. Authentication URLs and OTPs come from the existing backend flows; the renderer does not generate tokens or alter expiration behavior. `APP_URL` supplies the footer link.

## Add or change an email

1. Edit the master for shared styling or the corresponding `.mjml` fragment for content.
2. For a new template, add its title/preheader in `scripts/build-emails.mjs` and declare any new dynamic values in the compiler's placeholder list.
3. Run the build and check commands; include `compiled.ts` in the same change. Generated output is excluded from Prettier to keep the check deterministic.
4. Add rendering tests for dynamic values, escaping and action/fallback URLs. Review desktop and mobile previews.

Current copy remains English, matching the existing system emails. The renderer has no recipient locale contract yet; email localization is separate from the app's English/Bulgarian UI translations.

Browser previews and MJML validation do not replace testing in actual email clients. Outlook/Gmail/Apple Mail inbox rendering has not been exercised in this change. MJML's supported components and strict validation are documented in the [official MJML guide](https://documentation.mjml.io/).
