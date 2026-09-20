"use client";

import { CalendarDays, Check, Copy, Pencil, Trash2 } from "lucide-react";
import { Button } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import type { CampaignDetailViewProps } from "./campaign-detail-view";

function CampaignLifecycleActions({
  status,
  pending,
  onAction,
}: CampaignDetailViewProps) {
  const t = useTranslation();
  return (
    <>
      {status === "DRAFT" && (
        <Button
          size="sm"
          loading={pending.publish}
          onClick={() => onAction("publish")}
        >
          <Check size={16} />
          {t("campaignsUi.publish")}
        </Button>
      )}
      {["PENDING_START", "ACTIVE"].includes(status) && (
        <Button
          size="sm"
          loading={pending.pause}
          onClick={() => onAction("pause")}
        >
          {t("campaignsUi.pause")}
        </Button>
      )}
      {status === "PAUSED" && (
        <Button
          size="sm"
          loading={pending.resume}
          onClick={() => onAction("resume")}
        >
          {t("campaignsUi.resume")}
        </Button>
      )}
      {["ACTIVE", "PAUSED"].includes(status) && (
        <Button
          size="sm"
          variant="danger"
          loading={pending.complete}
          onClick={() => onAction("complete")}
        >
          {t("campaignsUi.complete")}
        </Button>
      )}
    </>
  );
}

export function CampaignDetailActions(props: CampaignDetailViewProps) {
  const t = useTranslation();
  const { status, type, pending } = props;
  return (
    <div className="flex flex-wrap gap-2">
      {["DRAFT", "PUBLISHED"].includes(status) && (
        <Button size="sm" variant="secondary" onClick={props.onEdit}>
          <Pencil size={16} />
          {t("campaignsUi.editShort")}
        </Button>
      )}
      <Button
        size="sm"
        variant="secondary"
        loading={pending.clone}
        onClick={() => props.onAction("clone")}
      >
        <Copy size={16} />
        {t("campaignsUi.clone")}
      </Button>
      {type === "CONCRETE" && status === "PUBLISHED" && (
        <Button size="sm" onClick={props.onSchedule}>
          <CalendarDays size={16} />
          {t("campaignsUi.schedule")}
        </Button>
      )}
      <CampaignLifecycleActions {...props} />
      {["DRAFT", "PUBLISHED", "COMPLETED", "FAILED"].includes(status) && (
        <Button
          size="sm"
          variant="danger"
          loading={pending.delete}
          onClick={() => props.onDeleteOpenChange(true)}
        >
          <Trash2 size={16} />
          {t("campaignsUi.deleteShort")}
        </Button>
      )}
    </div>
  );
}
