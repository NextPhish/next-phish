"use client";

import { ImageOff, CheckCircle2 } from "lucide-react";
import { memo } from "react";

interface CatalogCardProps {
  id: string;
  name: string;
  selected: boolean;
  status?: string;
  html?: string;
  preview?: { status: string; url: string | null } | null;
  onSelect: (id: string) => void;
  previewLabel?: string;
  selectLabel?: string;
  unavailableLabel?: string;
}

function CatalogCardComponent({
  id,
  name,
  selected,
  status,
  html,
  preview,
  onSelect,
  previewLabel = `Preview of ${name}`,
  selectLabel = `Select ${name}`,
  unavailableLabel = "Preview unavailable",
}: CatalogCardProps) {
  const selectedClass = selected
    ? "border-[var(--np-primary)] ring-2 ring-[var(--np-tint)]"
    : "border-[var(--np-border)] hover:border-[var(--np-primary)]";

  return (
    <article
      className={`w-full overflow-hidden rounded-xl border bg-[var(--np-surface)] text-left shadow-sm transition ${selectedClass}`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-white">
        {preview?.status === "READY" && preview.url ? (
          // Preview URLs are already generated thumbnails; render without a Next runtime dependency.
          <img
            src={preview.url}
            alt={previewLabel}
            sizes="(min-width: 1280px) 28vw, (min-width: 640px) 45vw, 90vw"
            className="h-full w-full object-cover object-top"
          />
        ) : html ? (
          <iframe
            title={previewLabel}
            srcDoc={html}
            sandbox=""
            referrerPolicy="no-referrer"
            scrolling="no"
            tabIndex={-1}
            className="pointer-events-none h-[200%] w-[200%] origin-top-left scale-50 border-0 bg-white"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--np-tint)] text-[var(--np-muted)]">
            <ImageOff size={28} aria-hidden="true" />
            <span className="sr-only">{unavailableLabel}</span>
          </div>
        )}
        <button
          type="button"
          aria-label={selectLabel}
          aria-pressed={selected}
          onClick={() => onSelect(id)}
          className="absolute inset-0 z-10 cursor-pointer border-0 bg-transparent p-0"
        />
      </div>

      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onSelect(id)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 border-0 bg-transparent p-3 text-left"
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-[var(--np-ink)]">
            {name}
          </span>
          {status && status !== "ACTIVE" ? (
            <span className="mt-1 block text-xs text-amber-700">
              {status.toLowerCase()}
            </span>
          ) : null}
        </span>
        {selected ? (
          <CheckCircle2
            size={18}
            className="text-[var(--np-primary)]"
            aria-hidden="true"
          />
        ) : null}
      </button>
    </article>
  );
}

export const CatalogCard = memo(CatalogCardComponent);
