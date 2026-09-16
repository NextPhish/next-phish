"use client";

import type { ReactNode } from "react";
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
import { CampaignDetailActions } from "./detail-actions";

type Action = "publish" | "pause" | "resume" | "complete" | "clone";
export interface CampaignDetailPresentationProps {
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
export function CampaignDetailPresentation(
  props: CampaignDetailPresentationProps,
) {
  const t = useTranslation();
  const { name, type, pending } = props;
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
        actions={<CampaignDetailActions {...props} />}
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
