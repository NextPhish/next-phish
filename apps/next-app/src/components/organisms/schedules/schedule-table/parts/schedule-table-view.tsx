"use client";
import { Button, DataTable, Dialog, FormMessage } from "@next-phish/ui";
import { uiTableLabels } from "@/src/lib/ui-table-labels";
import type { ScheduleTableModel } from "../hooks/use-schedule-table";
import type { ScheduleRow } from "../types/schedule-table.types";
const statuses = [
  "DRAFT",
  "SCHEDULED",
  "RUNNING",
  "COMPLETED",
  "CANCELLED",
] as const;
const types = ["ONE_TIME", "RECURRING"] as const;
export function ScheduleTableView({ model }: { model: ScheduleTableModel }) {
  const { t } = model;
  return (
    <section aria-labelledby="schedule-table-heading">
      <div className="mb-4">
        <h2
          id="schedule-table-heading"
          className="text-lg font-semibold text-[var(--np-ink)]"
        >
          {t("scheduleUi.title")}
        </h2>
        <p className="mt-1 text-sm text-[var(--np-muted)]">
          {t("scheduleUi.subtitle")}
        </p>
      </div>
      <DataTable
        mode="server"
        data={model.rows}
        total={model.total}
        columns={model.columns}
        getRowId={(row: ScheduleRow) => row.id}
        caption={t("scheduleUi.title")}
        state={model.state}
        onStateChange={model.onStateChange}
        loading={model.loading}
        error={model.loadError ? t("scheduleUi.loadError") : undefined}
        onRetry={model.onRetry}
        labels={{ ...uiTableLabels(t), search: t("scheduleUi.search") }}
        filters={[
          {
            field: "type",
            label: t("scheduleUi.type"),
            type: "select",
            options: types.map((value) => ({
              label: t(`scheduleUi.types.${value}`),
              value,
            })),
          },
          {
            field: "status",
            label: t("scheduleUi.status"),
            type: "select",
            options: statuses.map((value) => ({
              label: t(`scheduleUi.statuses.${value}`),
              value,
            })),
          },
        ]}
      />
      {model.mutationError && (
        <div className="mt-3">
          <FormMessage variant="error">{model.mutationError}</FormMessage>
        </div>
      )}
      <Dialog
        open={model.deleteOpen}
        onOpenChange={model.onDeleteOpenChange}
        title={t("scheduleUi.deleteTitle")}
        description={t("scheduleUi.deleteDescription")}
        closeLabel={t("common.cancel")}
        dismissible={!model.deletePending}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={model.deletePending}
              onClick={model.onCancelDelete}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              loading={model.deletePending}
              onClick={model.onConfirmDelete}
            >
              {t("scheduleUi.delete")}
            </Button>
          </>
        }
      >
        {null}
      </Dialog>
    </section>
  );
}
