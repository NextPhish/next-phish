"use client";

import type { ReactNode } from "react";
import { CalendarDays, Check, Copy, Pencil, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  FormMessage,
  PageHeader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import type { FormStatus } from "@/src/hooks/use-form-status";

type Action = "publish" | "pause" | "resume" | "complete" | "clone";
interface Props {
  name: string;
  type: "TEMPLATE" | "CONCRETE";
  status: string;
  statusLabel: string;
  statusTone: "success" | "danger" | "warning" | "neutral";
  savedMessage: string;
  actionStatus: FormStatus;
  pending: Record<Action | "delete", boolean>;
  deleteOpen: boolean;
  onDeleteOpenChange: (open: boolean) => void;
  onAction: (action: Action) => void;
  onDelete: () => void;
  onEdit: () => void;
  onSchedule: () => void;
  overview: ReactNode;
  statistics: ReactNode;
  recipients: ReactNode;
}
export function CampaignDetailPresentation(props: Props) {
  const t = useTranslation();
  const { name, status, type, pending } = props;
  return (
    <div className="grid min-w-0 gap-6 text-[var(--np-ink)]">
      <PageHeader
        title={name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={props.statusTone}>{props.statusLabel}</Badge>
            {t(
              type === "TEMPLATE"
                ? "campaignsUi.templateDescription"
                : "campaignsUi.concreteDescription",
            )}
          </span>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {["DRAFT", "PUBLISHED"].includes(status) && (
              <Button size="sm" variant="secondary" onClick={props.onEdit}>
                <Pencil size={16} />
                {t("campaignsUi.editShort")}
              </Button>
            )}
            {status === "DRAFT" && (
              <Button
                size="sm"
                loading={pending.publish}
                onClick={() => props.onAction("publish")}
              >
                <Check size={16} />
                {t("campaignsUi.publish")}
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
            {["PENDING_START", "ACTIVE"].includes(status) && (
              <Button
                size="sm"
                loading={pending.pause}
                onClick={() => props.onAction("pause")}
              >
                {t("campaignsUi.pause")}
              </Button>
            )}
            {status === "PAUSED" && (
              <Button
                size="sm"
                loading={pending.resume}
                onClick={() => props.onAction("resume")}
              >
                {t("campaignsUi.resume")}
              </Button>
            )}
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
            {["ACTIVE", "PAUSED"].includes(status) && (
              <Button
                size="sm"
                variant="danger"
                loading={pending.complete}
                onClick={() => props.onAction("complete")}
              >
                {t("campaignsUi.complete")}
              </Button>
            )}
          </div>
        }
      />
      {(props.savedMessage || props.actionStatus.type === "success") && (
        <FormMessage variant="success">
          {props.actionStatus.type === "success"
            ? props.actionStatus.message
            : props.savedMessage}
        </FormMessage>
      )}
      {props.actionStatus.type === "error" && !props.deleteOpen && (
        <FormMessage variant="error">{props.actionStatus.message}</FormMessage>
      )}
      {type === "TEMPLATE" ? (
        props.overview
      ) : (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">
              {t("campaignsUi.overview")}
            </TabsTrigger>
            <TabsTrigger value="statistics">
              {t("campaignsUi.statistics")}
            </TabsTrigger>
            <TabsTrigger value="recipients">
              {t("campaignsUi.recipients")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">{props.overview}</TabsContent>
          <TabsContent value="statistics">{props.statistics}</TabsContent>
          <TabsContent value="recipients">{props.recipients}</TabsContent>
        </Tabs>
      )}
      <Dialog
        open={props.deleteOpen}
        onOpenChange={props.onDeleteOpenChange}
        title={t("campaignsUi.deleteTitle")}
        description={t("campaignsUi.deleteConfirm", { name })}
        closeLabel={t("common.cancel")}
        dismissible={!pending.delete}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={pending.delete}
              onClick={() => props.onDeleteOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              loading={pending.delete}
              onClick={props.onDelete}
            >
              {t("campaignsUi.deleteShort")}
            </Button>
          </>
        }
      >
        {props.actionStatus.type === "error" && (
          <FormMessage variant="error">
            {props.actionStatus.message}
          </FormMessage>
        )}
      </Dialog>
    </div>
  );
}
