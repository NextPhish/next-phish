"use client";

import { Search } from "lucide-react";
import { Button, Input, Select, Skeleton } from "@next-phish/ui";
import type { CatalogPreviewView } from "@next-phish/shared";
import { CatalogCard } from "@/src/components/molecules/catalog-card";

interface CatalogItem {
  id: string;
  name: string;
  status: string;
  html?: string;
  preview: CatalogPreviewView | null;
}

interface AssetCatalogTabProps {
  title: string;
  description: string;
  searchPlaceholder: string;
  emptyMessage: string;
  items: CatalogItem[];
  total: number;
  loading: boolean;
  selectedId: string;
  search: string;
  offset: number;
  limit: number;
  onSearch: (value: string) => void;
  onPage: (offset: number, limit: number) => void;
  onSelect: (id: string) => void;
  labels?: {
    preview: (name: string) => string;
    select: (name: string) => string;
    unavailable: string;
    perPage: string;
    page: (page: number, pages: number) => string;
    previous: string;
    next: string;
  };
}

export function AssetCatalogTab({
  title,
  description,
  searchPlaceholder,
  emptyMessage,
  items,
  total,
  loading,
  selectedId,
  search,
  offset,
  limit,
  onSearch,
  onPage,
  onSelect,
  labels,
}: AssetCatalogTabProps) {
  const page = Math.floor(offset / limit) + 1;
  const pages = Math.max(1, Math.ceil(total / limit));
  return (
    <section className="rounded-2xl border border-[var(--np-border)] bg-[var(--np-surface)] p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--np-ink)]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[var(--np-muted)]">{description}</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--np-muted)]"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: limit }, (_, index) => (
            <Skeleton
              key={index}
              style={{ height: "13rem", borderRadius: "1rem" }}
            />
          ))}
        </div>
      ) : items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <CatalogCard
              key={item.id}
              {...item}
              selected={selectedId === item.id}
              onSelect={onSelect}
              previewLabel={
                labels?.preview(item.name) ?? `Preview of ${item.name}`
              }
              selectLabel={labels?.select(item.name) ?? `Select ${item.name}`}
              unavailableLabel={labels?.unavailable ?? "Preview unavailable"}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--np-border)] px-5 py-12 text-center text-sm text-[var(--np-muted)]">
          {emptyMessage}
        </div>
      )}

      {total > limit ? (
        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
          <Select
            aria-label={labels?.perPage ?? "Items per page"}
            value={String(limit)}
            options={[6, 12, 24].map((value) => ({
              value: String(value),
              label: String(value),
            }))}
            onValueChange={(value) => onPage(0, Number(value))}
          />
          <span className="text-sm text-[var(--np-muted)]">
            {labels?.page(page, pages) ?? `Page ${page} of ${pages}`}
          </span>
          <Button
            size="sm"
            variant="secondary"
            disabled={page === 1}
            onClick={() => onPage(Math.max(0, offset - limit), limit)}
          >
            {labels?.previous ?? "Previous"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={page === pages}
            onClick={() => onPage(offset + limit, limit)}
          >
            {labels?.next ?? "Next"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
