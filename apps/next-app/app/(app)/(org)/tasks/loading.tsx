"use client";
import { TaskBoardSkeleton } from "@/src/components/organisms/tasks/task-board-skeleton";
import { useTranslation } from "@/src/lib/i18n/client";
export default function Loading() {
  const t = useTranslation();
  return <TaskBoardSkeleton label={t("tasks.loading")} />;
}
