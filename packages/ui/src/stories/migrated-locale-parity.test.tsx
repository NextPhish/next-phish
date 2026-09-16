import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { expect, it } from "vitest";
import {
  getMessages,
  type Messages,
} from "../../../../apps/next-app/src/lib/i18n/shared";

const migratedSections = [
  "campaignsUi",
  "pages",
  "emailTemplates",
  "sendingProfiles",
  "targetGroups",
  "usersUi",
  "settings",
] as const;

function leafKeys(
  value: string | Messages | undefined,
  prefix: string,
): string[] {
  if (typeof value === "string") return [prefix];
  if (!value) return [];
  return Object.entries(value).flatMap(([key, child]) =>
    leafKeys(child, `${prefix}.${key}`),
  );
}

it.each(migratedSections)(
  "has matching English and Bulgarian keys for %s",
  (section) => {
    const en = getMessages("en");
    const bg = getMessages("bg");
    const english = leafKeys(en[section], section);
    const bulgarian = leafKeys(bg[section], section);
    expect(english.length).toBeGreaterThan(0);
    expect(bulgarian.length).toBeGreaterThan(0);
    expect(english.filter((key) => !bulgarian.includes(key))).toEqual([]);
    expect(bulgarian.filter((key) => !english.includes(key))).toEqual([]);
  },
);

it("resolves literal translation references in migrated sections", () => {
  const appPath = "apps/next-app/src/components/organisms";
  const root = existsSync(resolve(process.cwd(), appPath))
    ? resolve(process.cwd(), appPath)
    : resolve(process.cwd(), "../../", appPath);
  const folders = [
    "campaigns",
    "pages",
    "email-templates",
    "sending-profiles",
    "target-groups",
    "users",
    "settings",
  ];
  const keys = new Set<string>();
  function scan(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        scan(path);
      } else if (/\.tsx?$/.test(entry.name)) {
        const source = readFileSync(path, "utf8");
        for (const match of source.matchAll(/\bt\(\s*["'`]([\w.]+)["'`]/g)) {
          if (
            migratedSections.some((section) =>
              match[1]?.startsWith(`${section}.`),
            )
          ) {
            keys.add(match[1]!);
          }
        }
      }
    }
  }
  folders.forEach((folder) => scan(join(root, folder)));
  for (const locale of ["en", "bg"] as const) {
    const messages = getMessages(locale);
    expect(
      [...keys].filter(
        (key) =>
          typeof key
            .split(".")
            .reduce<unknown>(
              (value, segment) =>
                value && typeof value === "object"
                  ? (value as Messages)[segment]
                  : undefined,
              messages,
            ) !== "string",
      ),
    ).toEqual([]);
  }
});
