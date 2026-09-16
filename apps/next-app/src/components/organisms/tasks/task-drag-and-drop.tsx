"use client";

import { useId, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { Card } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import styles from "./tasks-board.module.css";

type DragTask = { id: string; title: string; statusId: string };
type DragStatus = { id: string; name: string };

export function TaskDragAndDrop({
  tasks,
  statuses,
  disabled,
  onMove,
  children,
}: {
  tasks: DragTask[];
  statuses: DragStatus[];
  disabled: boolean;
  onMove: (input: { id: string; statusId: string }) => void;
  children: ReactNode;
}) {
  const t = useTranslation();
  const id = useId();
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeTask = tasks.find((task) => task.id === activeId);
  const coordinates: KeyboardCoordinateGetter = (event, { context }) => {
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.code)
    )
      return;
    event.preventDefault();
    const task = tasks.find((item) => item.id === context.active?.id);
    const current = statuses.findIndex(
      (status) => status.id === (context.over?.id ?? task?.statusId),
    );
    const direction = ["ArrowRight", "ArrowDown"].includes(event.code) ? 1 : -1;
    const next = statuses[current + direction];
    const rect = next && context.droppableRects.get(next.id);
    const activeRect = context.collisionRect;
    if (!rect || !activeRect) return;
    return {
      x: rect.left + (rect.width - activeRect.width) / 2,
      y: rect.top + (rect.height - activeRect.height) / 2,
    };
  };
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: coordinates }),
  );
  const taskTitle = (taskId: string | number) =>
    tasks.find((task) => task.id === taskId)?.title ?? "";
  const statusName = (statusId: string | number) =>
    statuses.find((status) => status.id === statusId)?.name ?? "";

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={(args) =>
        args.pointerCoordinates ? pointerWithin(args) : rectIntersection(args)
      }
      accessibility={{
        screenReaderInstructions: { draggable: t("tasks.dragInstructions") },
        announcements: {
          onDragStart: ({ active }) =>
            t("tasks.dragStarted", { title: taskTitle(active.id) }),
          onDragOver: ({ over }) =>
            over
              ? t("tasks.dragOver", { status: statusName(over.id) })
              : t("tasks.dragOutside"),
          onDragEnd: ({ over }) =>
            over
              ? t("tasks.dragDropped", { status: statusName(over.id) })
              : t("tasks.dragCancelled"),
          onDragCancel: () => t("tasks.dragCancelled"),
        },
      }}
      onDragStart={({ active }) => setActiveId(String(active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={({ active, over }) => {
        setActiveId(null);
        const task = tasks.find((item) => item.id === active.id);
        const target = statuses.find((status) => status.id === over?.id);
        if (!disabled && task && target && task.statusId !== target.id)
          onMove({ id: task.id, statusId: target.id });
      }}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className={styles.dragPreview} aria-hidden="true">
            <GripVertical size={18} />
            {activeTask.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export function TaskDropColumn({
  status,
  disabled,
  children,
}: {
  status: DragStatus;
  disabled: boolean;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id, disabled });
  return (
    <Card
      ref={setNodeRef}
      className={`${styles.column} ${isOver ? styles.dropTarget : ""}`}
      aria-labelledby={`status-${status.id}`}
    >
      {children}
    </Card>
  );
}

export function DraggableTask({
  task,
  disabled,
  children,
}: {
  task: DragTask;
  disabled: boolean;
  children: ReactNode;
}) {
  const t = useTranslation();
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, isDragging } =
    useDraggable({ id: task.id, disabled });
  return (
    <article
      ref={setNodeRef}
      className={`${styles.taskCard} ${isDragging ? styles.dragging : ""}`}
      aria-busy={disabled}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        className={styles.dragHandle}
        disabled={disabled}
        aria-label={t("tasks.dragTask", { title: task.title })}
        title={t("tasks.dragHint")}
      >
        <GripVertical size={18} aria-hidden="true" />
      </button>
      {children}
    </article>
  );
}
