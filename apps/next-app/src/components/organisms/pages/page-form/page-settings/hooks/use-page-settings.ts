import type { PageListItemView } from "@next-phish/shared";
import { trpc } from "@/src/lib/trpc";
import { usePageRedirectSelector } from "./use-page-redirect-selector";
import type { PageSettingsValues } from "../types/page-settings.types";

interface Options {
  pageId?: string;
  values: PageSettingsValues;
}

export function usePageSettings({ pageId, values }: Options) {
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

  return {
    selectorVisible,
    onSelectorVisibleChange: setOpen,
    pages,
    selectedPage,
    pagesTotal: query.data?.total ?? 0,
    pagesLoading: query.isLoading,
    search: state.input,
    offset,
    limit,
    onSearch: setSearch,
    onPage: setPage,
  };
}
