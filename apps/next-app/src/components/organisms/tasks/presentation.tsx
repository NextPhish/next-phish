"use client";

import { useMemo, useState, type ElementType } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Plus,
  Search,
  Settings2,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  FilterBar,
  FormMessage,
  Input,
  PageHeader,
  Select,
  type TableFilter,
} from "@next-phish/ui";
import type { useTaskBoard } from "@/src/hooks/use-task-board";
import { useLocale, useTranslation } from "@/src/lib/i18n/client";
import styles from "./tasks-board.module.css";
import {
  TaskDragAndDrop,
  TaskDropColumn,
  DraggableTask,
} from "./task-drag-and-drop";
import { TaskBoardSkeleton } from "./task-board-skeleton";

type Board = ReturnType<typeof useTaskBoard>;
type Task = Board["tasks"][number];
interface Props {
  linkComponent?: ElementType;
  board: Board;
  onCreate: (statusId?: string) => void;
  onEdit: (task: Task) => void;
  onManageStatuses: () => void;
}

const legacyColors: Record<string, string> = {
  neutral: "#64748b",
  blue: "#29b8ff",
  indigo: "#5c73ff",
  violet: "#7b5cff",
  cyan: "#15e5d4",
};
function statusColor(value: string) {
  return legacyColors[value] ?? value;
}
function descriptionPreview(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function TasksPresentation({
  linkComponent: Link = "a",
  board,
  onCreate,
  onEdit,
  onManageStatuses,
}: Props) {
  const t = useTranslation();
  const locale = useLocale();
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );
  const [statusFilterAdded, setStatusFilterAdded] = useState(false);
  const visibleStatuses = useMemo(() => {
    if (!board.filters.statusIds.length) return board.statuses;
    const selected = new Set(board.filters.statusIds);
    return board.statuses.filter((status) => selected.has(status.id));
  }, [board.filters.statusIds, board.statuses]);
  const tasksByStatus = useMemo(() => {
    const grouped = new Map<string, Task[]>();
    for (const task of board.tasks)
      grouped.set(task.statusId, [...(grouped.get(task.statusId) ?? []), task]);
    return grouped;
  }, [board.tasks]);
  const statusOptions = useMemo(
    () => board.statuses.map(({ id, name }) => ({ value: id, label: name })),
    [board.statuses],
  );
  const filters = useMemo<TableFilter[]>(
    () => [
      {
        field: "status",
        label: t("tasks.status"),
        type: "select",
        options: statusOptions,
      },
    ],
    [statusOptions, t],
  );

  if (board.isLoading) return <TaskBoardSkeleton label={t("tasks.loading")} />;

  return (
    <section className={styles.root}>
      <PageHeader
        title={t("tasks.title")}
        description={t("tasks.subtitle")}
        actions={
          <>
            <Button variant="secondary" onClick={onManageStatuses}>
              <Settings2 size={16} aria-hidden="true" />
              {t("tasks.manageStatuses")}
            </Button>
            <Button onClick={() => onCreate()}>
              <Plus size={16} aria-hidden="true" />
              {t("tasks.createTask")}
            </Button>
          </>
        }
      />
      <Card className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={16} aria-hidden="true" />
          <Input
            value={board.filters.search}
            onChange={(event) => board.setSearch(event.target.value)}
            placeholder={t("tasks.search")}
            aria-label={t("tasks.search")}
          />
        </div>
        <FilterBar
          filters={filters}
          values={
            statusFilterAdded || board.filters.statusIds.length > 0
              ? { status: board.filters.statusIds[0] ?? "" }
              : {}
          }
          onChange={(_field, value) => {
            setStatusFilterAdded(true);
            board.setStatusIds(value ? [String(value)] : []);
          }}
          onRemove={() => {
            setStatusFilterAdded(false);
            board.setStatusIds([]);
          }}
          onClear={() => {
            setStatusFilterAdded(false);
            board.setStatusIds([]);
          }}
          addLabel={t("tableUi.addFilter")}
          clearLabel={t("tableUi.clearFilters")}
          placeholder={t("tableUi.choose")}
          removeLabel={(label) => t("tableUi.removeFilter", { label })}
        />
      </Card>
      {board.error && (
        <FormMessage
          variant="error"
          action={
            <Button variant="secondary" size="sm" onClick={() => board.retry()}>
              {t("tableUi.retry")}
            </Button>
          }
        >
          {t("tasks.loadFailed")}
        </FormMessage>
      )}
      {board.moveError && (
        <FormMessage variant="error">{t("tasks.moveFailed")}</FormMessage>
      )}
      <TaskDragAndDrop
        tasks={board.tasks}
        statuses={visibleStatuses}
        disabled={board.move.isPending}
        onMove={(input) => board.move.mutate(input)}
      >
        <div className={styles.board} aria-label={t("tasks.title")}>
          {visibleStatuses.map((status) => {
            const tasks = tasksByStatus.get(status.id) ?? [];
            return (
              <TaskDropColumn
                key={status.id}
                status={status}
                disabled={board.move.isPending}
              >
                <div className={styles.columnHeader}>
                  <h2 id={`status-${status.id}`}>
                    <span
                      className={styles.statusDot}
                      style={{
                        backgroundColor: statusColor(status.colorToken),
                      }}
                    />
                    {status.name}
                    <Badge tone="neutral">{tasks.length}</Badge>
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={styles.iconButton}
                    aria-label={`${t("tasks.addTask")}: ${status.name}`}
                    onClick={() => onCreate(status.id)}
                  >
                    <Plus size={16} aria-hidden="true" />
                  </Button>
                </div>
                <div className={styles.taskList}>
                  {tasks.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => onCreate(status.id)}
                      className={styles.emptyColumn}
                    >
                      <Plus size={16} aria-hidden="true" />
                      {t("tasks.addTask")}
                    </button>
                  ) : (
                    tasks.map((task) => (
                      <DraggableTask
                        key={task.id}
                        task={task}
                        disabled={board.move.isPending}
                      >
                        <button
                          type="button"
                          onClick={() => onEdit(task)}
                          className={styles.taskContent}
                        >
                          <div className={styles.taskTitleRow}>
                            <h3>{task.title}</h3>
                            <Badge
                              tone={
                                task.priority === "HIGH"
                                  ? "danger"
                                  : task.priority === "LOW"
                                    ? "neutral"
                                    : "info"
                              }
                            >
                              {t(`tasks.${task.priority.toLowerCase()}`)}
                            </Badge>
                          </div>
                          {task.description && (
                            <p>{descriptionPreview(task.description)}</p>
                          )}
                        </button>
                        {(task.relation || task.dueAt) && (
                          <div className={styles.meta}>
                            {task.relation && (
                              <Link href={task.relation.href}>
                                {task.relation.name}
                                <ArrowRight size={13} aria-hidden="true" />
                              </Link>
                            )}
                            {task.dueAt && (
                              <span
                                className={task.isOverdue ? styles.overdue : ""}
                              >
                                {task.isOverdue ? (
                                  <AlertTriangle size={13} aria-hidden="true" />
                                ) : (
                                  <CalendarDays size={13} aria-hidden="true" />
                                )}
                                {task.isOverdue
                                  ? `${t("tasks.overdue")} · `
                                  : ""}
                                {dateFormatter.format(new Date(task.dueAt))}
                              </span>
                            )}
                          </div>
                        )}
                        <div className={styles.moveControl}>
                          <label htmlFor={`task-status-${task.id}`}>
                            {t("tasks.moveTo")}
                          </label>
                          <Select
                            id={`task-status-${task.id}`}
                            aria-label={`${t("tasks.moveTo")} ${task.title}`}
                            value={task.statusId}
                            options={statusOptions}
                            disabled={board.move.isPending}
                            onValueChange={(statusId) =>
                              board.move.mutate({ id: task.id, statusId })
                            }
                          />
                        </div>
                      </DraggableTask>
                    ))
                  )}
                </div>
              </TaskDropColumn>
            );
          })}
        </div>
      </TaskDragAndDrop>
      {board.total >= 100 && (
        <p className={styles.limit}>{t("tasks.showingLimit")}</p>
      )}
    </section>
  );
}
