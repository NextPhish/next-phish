"use client";

import { useState } from "react";
import { Input } from "@next-phish/ui";
import { CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";

interface PreviousImport {
  id: string;
  url: string;
  finalUrl: string | null;
  status: string;
  includeAssets: boolean;
  html: string | null;
  assetDownloaded: number;
  fileCount: number;
  createdAt: Date;
}

interface PreviousImportsListProps {
  imports: PreviousImport[];
  t: (key: string) => string;
  onSelect: (imp: PreviousImport) => void;
  onSearch: (query: string) => void;
}

export function PreviousImportsList({
  imports,
  t,
  onSelect,
  onSearch,
}: PreviousImportsListProps) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");

  if (imports.length === 0) return null;

  function handleSearchChange(value: string) {
    setSearch(value);
    onSearch(value);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-[var(--np-muted)] transition-colors hover:text-[var(--np-primary)]"
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {t("pages.previousImports")} ({imports.length})
      </button>

      {expanded && (
        <div className="space-y-2">
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("pages.searchImports")}
            className="mb-3 w-full text-sm"
          />

          <div className="mt-3 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-[var(--np-border)] bg-[var(--np-surface-subtle)] p-2">
            {imports.map((imp) => (
              <button
                key={imp.id}
                type="button"
                onClick={() => onSelect(imp)}
                className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--np-tint)]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[var(--np-ink)]">
                    {imp.finalUrl || imp.url}
                  </p>
                  <p className="text-xs text-[var(--np-muted)]">
                    {imp.includeAssets
                      ? t("pages.fileCount").replace(
                          "{count}",
                          String(imp.fileCount),
                        )
                      : t("pages.htmlOnly")}
                    {" · "}
                    {new Date(imp.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <CheckCircle2
                  className="ml-2 text-[var(--np-success)]"
                  size={15}
                  aria-hidden="true"
                />
              </button>
            ))}

            {imports.length === 0 && search && (
              <p className="px-3 py-2 text-xs text-zinc-500">
                {t("pages.noMatchingImports").replace("{search}", search)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
