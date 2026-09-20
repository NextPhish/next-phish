"use client";

import { ArrowLeft, Copy, Pencil, Play, Trash2, X } from "lucide-react";
import { Badge, Button, PageHeader } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import type { ScheduleDetail } from "./schedule-detail-content";

function statusTone(status: string) {
  if (status === "CANCELLED" || status === "BROKEN") return "danger" as const;
  if (status === "COMPLETED") return "success" as const;
  if (status === "RUNNING" || status === "SCHEDULED") return "info" as const;
  return "neutral" as const;
}

export function ScheduleDetailToolbar({
  id,
  data,
  onNavigate,
  onActivate,
  onDuplicate,
  onCancel,
  onDelete,
  activatePending,
  duplicatePending,
  cancelPending,
}: {
  id: string;
  data: ScheduleDetail;
  onNavigate: (path: string) => void;
  onActivate: () => void;
  onDuplicate: () => void;
  onCancel: () => void;
  onDelete: () => void;
  activatePending: boolean;
  duplicatePending: boolean;
  cancelPending: boolean;
}) {
  const t = useTranslation();
  const canEdit = data.status !== "COMPLETED" && data.status !== "CANCELLED";
  return (
    <>
      <PageHeader
        title={data.name}
        description={`${t(`scheduleUi.values.${data.type}`)} · ${data.targetTimezone}`}
        actions={
          <>
            <Badge tone={statusTone(data.status)}>
              {t(`scheduleUi.values.${data.status}`)}
            </Badge>
            {canEdit && (
              <Button onClick={() => onNavigate(`/schedule/${id}/edit`)}>
                <Pencil size={16} aria-hidden="true" />
                {t("scheduleUi.edit")}
              </Button>
            )}
          </>
        }
      />
      <div className="flex flex-wrap gap-2.5">
        {data.status === "DRAFT" && (
          <Button
            loading={activatePending}
            onClick={() => {
              onActivate();
            }}
          >
            <Play size={16} aria-hidden="true" />
            {t("scheduleUi.activate")}
          </Button>
        )}
        <Button
          variant="secondary"
          loading={duplicatePending}
          onClick={() => {
            onDuplicate();
          }}
        >
          <Copy size={16} aria-hidden="true" />
          {t("scheduleUi.duplicate")}
        </Button>
        {canEdit && (
          <Button
            variant="secondary"
            loading={cancelPending}
            onClick={() => {
              onCancel();
            }}
          >
            <X size={16} aria-hidden="true" />
            {t("scheduleUi.cancelSchedule")}
          </Button>
        )}
        <Button variant="danger" onClick={() => onDelete()}>
          <Trash2 size={16} aria-hidden="true" />
          {t("scheduleUi.delete")}
        </Button>
        <Button variant="ghost" onClick={() => onNavigate("/schedule")}>
          <ArrowLeft size={16} aria-hidden="true" />
          {t("scheduleUi.back")}
        </Button>
      </div>
    </>
  );
}
