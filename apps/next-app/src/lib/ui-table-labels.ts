import type { DataTableLabels } from "@next-phish/ui";
import type { TranslationFunction } from "./i18n/shared";

export function uiTableLabels(t: TranslationFunction): DataTableLabels {
  return {
    search: t("common.search"),
    rowsPerPage: t("tableUi.rowsPerPage"),
    previous: t("tableUi.previous"),
    next: t("tableUi.next"),
    loading: t("common.loading"),
    empty: t("common.noRecordsFound"),
    noResults: t("tableUi.noResults"),
    clear: t("tableUi.clear"),
    clearFilters: t("tableUi.clearFilters"),
    addFilter: t("tableUi.addFilter"),
    filterPlaceholder: t("tableUi.choose"),
    removeFilter: (label) => t("tableUi.removeFilter", { label }),
    error: t("tableUi.error"),
    retry: t("tableUi.retry"),
    page: (page, pages, total) => t("tableUi.page", { page, pages, total }),
  };
}
