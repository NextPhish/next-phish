"use client";

import { Checkbox } from "@next-phish/ui";

interface AssetsToggleProps {
  checked: boolean;
  t: (key: string) => string;
  onChange: (value: boolean) => void;
}

export function AssetsToggle({ checked, t, onChange }: AssetsToggleProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--np-border)] bg-[var(--np-surface-subtle)] p-3">
      <Checkbox
        id="includeAssets"
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
      />
      <div>
        <label
          htmlFor="includeAssets"
          className="block cursor-pointer text-sm font-medium text-[var(--np-ink)]"
        >
          {t("pages.includeAssets")}
        </label>
        <p className="mt-1 text-xs text-[var(--np-muted)]">
          {t("pages.includeAssetsHint")}
        </p>
      </div>
    </div>
  );
}
