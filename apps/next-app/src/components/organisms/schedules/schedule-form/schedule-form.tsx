"use client";

import { Formik } from "formik";
import { PageHeader, Skeleton } from "@next-phish/ui";
import type { ScheduleFormValues } from "@next-phish/shared";
import { useScheduleForm } from "./hooks/use-schedule-form";
import { ScheduleFormView } from "./parts/schedule-form-view";

export function ScheduleForm({
  campaignId,
  scheduleId,
}: {
  campaignId?: string;
  scheduleId?: string;
}) {
  const model = useScheduleForm(campaignId, scheduleId);
  if (model.notFound)
    return (
      <div className="np-theme mx-auto max-w-[1120px] p-0 text-[#172033]">
        <p className="mt-[0.3rem] mb-0 text-sm text-[#626d80]">
          {model.t("scheduleUi.notFound")}
        </p>
      </div>
    );
  return (
    <div className="np-theme mx-auto max-w-[1120px] p-0 text-[#172033]">
      <PageHeader
        title={model.t(
          scheduleId ? "scheduleUi.editTitle" : "scheduleUi.createTitle",
        )}
        description={model.t("scheduleUi.formSubtitle")}
      />
      {model.loading ? (
        <div
          className="mt-6 grid gap-5 [&>*]:rounded-2xl"
          role="status"
          aria-label={model.t("scheduleUi.loadingForm")}
        >
          <Skeleton style={{ height: 220 }} />
          <Skeleton style={{ height: 180 }} />
          <Skeleton style={{ height: 160 }} />
        </div>
      ) : (
        <Formik<ScheduleFormValues>
          initialValues={model.initialValues}
          enableReinitialize
          validateOnChange={false}
          validate={model.validate}
          onSubmit={model.submit}
        >
          <ScheduleFormView
            error={model.error}
            campaigns={model.campaigns}
            targetGroups={model.targetGroups}
            onCancel={model.cancel}
          />
        </Formik>
      )}
    </div>
  );
}
