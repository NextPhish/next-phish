"use client";
import { usePageRedirectSelector } from "@/src/hooks/use-page-redirect-selector";
import type { PageListItemView } from "@next-phish/shared";
import { trpc } from "@/src/lib/trpc";
import {
  PageSettingsPresentation,
  type PageSettingsValues,
} from "./page-settings-presentation";

interface Props {
  pageId?: string;
  values: PageSettingsValues;
  setFieldValue: (
    field: string,
    value: string | boolean | null,
    shouldValidate?: boolean,
  ) => Promise<unknown>;
  t: (key: string) => string;
}
export function PageSettingsFields({
  pageId,
  values,
  setFieldValue,
  t,
}: Props) {
  const { state, setOpen, setSearch, setPage } = usePageRedirectSelector();
  const { open: selectorVisible, search, offset, limit } = state;
  const query = trpc.page.list.useQuery(
    {
      search: search || undefined,
      selectedId: selectorVisible
        ? undefined
        : (values.redirectPageId ?? undefined),
      limit,
      offset,
      filters: { status: "ACTIVE", type: "REDIRECT" },
    },
    {
      enabled: selectorVisible || Boolean(values.redirectPageId),
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  );
  const pages = (query.data?.pages ?? []).filter(
    (page) => page.id !== pageId,
  ) as PageListItemView[];
  const selectedPage = query.data?.pages.find(
    (page) => page.id === values.redirectPageId,
  ) as PageListItemView | undefined;
  return (
    <PageSettingsPresentation
      pageId={pageId}
      values={values}
      setFieldValue={setFieldValue}
      t={t}
      selectorVisible={selectorVisible}
      onSelectorVisibleChange={setOpen}
      pages={pages}
      selectedPage={selectedPage}
      pagesTotal={query.data?.total ?? 0}
      pagesLoading={query.isLoading}
      search={state.input}
      offset={offset}
      limit={limit}
      onSearch={setSearch}
      onPage={setPage}
    />
  );
}
