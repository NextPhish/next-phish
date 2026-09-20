"use client";

import { usePagesList } from "./hooks/use-pages-list";
import { PagesListView } from "./parts/pages-list-view";

export function PagesList() {
  return <PagesListView {...usePagesList()} />;
}
