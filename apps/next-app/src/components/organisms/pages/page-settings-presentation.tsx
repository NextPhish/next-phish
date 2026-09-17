"use client";
import type { FieldInputProps } from "formik";
import { ErrorMessage, Field } from "formik";
import type { PageListItemView } from "@next-phish/shared";
import {
  Button,
  Dialog,
  FormField,
  HelpTooltip,
  Input,
  Select,
} from "@next-phish/ui";
import { AssetCatalogTab } from "@/src/components/organisms/catalog/asset-catalog";

export interface PageSettingsValues {
  path: string | null;
  type: "LANDING" | "REDIRECT";
  status: "DRAFT" | "ACTIVE";
  redirectTarget: "none" | "page" | "url";
  redirectPageId: string | null;
  redirectUrl: string | null;
}
export interface PageSettingsPresentationProps {
  pageId?: string;
  values: PageSettingsValues;
  setFieldValue: (
    field: string,
    value: string | boolean | null,
    shouldValidate?: boolean,
  ) => Promise<unknown>;
  t: (key: string, params?: Record<string, string | number>) => string;
  selectorVisible: boolean;
  onSelectorVisibleChange: (open: boolean) => void;
  pages: PageListItemView[];
  selectedPage?: PageListItemView;
  pagesTotal: number;
  pagesLoading: boolean;
  search: string;
  offset: number;
  limit: number;
  onSearch: (value: string) => void;
  onPage: (offset: number, limit: number) => void;
}
export function PageSettingsPresentation(props: PageSettingsPresentationProps) {
  const { values, setFieldValue, t } = props;
  return (
    <div className="mb-3 flex flex-col gap-3">
      <FormField
        label={t("pages.type")}
        id="page-type"
        labelAdornment={
          <HelpTooltip label={t("pages.typeHelpLabel")}>
            <p>
              <strong>{t("pages.typeLanding")}</strong>
              <br />
              {t("pages.typeLandingHelp")}
            </p>
            <p>
              <strong>{t("pages.typeRedirect")}</strong>
              <br />
              {t("pages.typeRedirectHelp")}
            </p>
          </HelpTooltip>
        }
      >
        {(control) => (
          <Select
            {...control}
            value={values.type}
            options={[
              { label: t("pages.typeLanding"), value: "LANDING" },
              { label: t("pages.typeRedirect"), value: "REDIRECT" },
            ]}
            onValueChange={(value) => void setFieldValue("type", value)}
            disabled={Boolean(props.pageId)}
          />
        )}
      </FormField>
      <Field name="path">
        {({ field }: { field: FieldInputProps<string | null> }) => (
          <FormField
            label={t("pages.path")}
            hint={t("pages.pathHint")}
            id="page-path"
          >
            {(control) => (
              <Input
                {...control}
                {...field}
                value={field.value ?? ""}
                placeholder={t("pages.pathPlaceholder")}
              />
            )}
          </FormField>
        )}
      </Field>
      <ErrorMessage name="path" component="p" className="np-field-error" />
      <FormField label={t("pages.status")} id="page-status">
        {(control) => (
          <Select
            {...control}
            value={values.status}
            options={[
              { label: t("common.draft"), value: "DRAFT" },
              { label: t("common.active"), value: "ACTIVE" },
            ]}
            onValueChange={(value) => void setFieldValue("status", value)}
          />
        )}
      </FormField>
      <FormField label={t("pages.redirectTarget")} id="page-redirect-target">
        {(control) => (
          <Select
            {...control}
            value={values.redirectTarget}
            options={[
              { label: t("pages.redirectNone"), value: "none" },
              { label: t("pages.redirectTargetPage"), value: "page" },
              { label: t("pages.redirectTargetUrl"), value: "url" },
            ]}
            onValueChange={async (value) => {
              await Promise.all([
                setFieldValue("redirectTarget", value),
                setFieldValue("redirectPageId", null),
                setFieldValue("redirectUrl", null),
              ]);
            }}
          />
        )}
      </FormField>
      {values.redirectTarget === "page" && (
        <div className="space-y-2">
          <span className="block text-sm font-medium text-[var(--np-ink)]">
            {t("pages.redirectPage")}
          </span>
          <div className="rounded-xl border border-[var(--np-border)] bg-[var(--np-surface-subtle)] p-3">
            <p className="truncate text-sm font-medium text-[var(--np-ink)]">
              {props.selectedPage?.name ?? t("pages.noRedirectPageSelected")}
            </p>
            <p className="mt-1 text-xs text-[var(--np-muted)]">
              {props.selectedPage?.path
                ? `/${props.selectedPage.path}`
                : t("pages.redirectPageHint")}
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-3 w-full justify-center"
              onClick={() => props.onSelectorVisibleChange(true)}
            >
              {props.selectedPage
                ? t("pages.changeRedirectPage")
                : t("pages.selectRedirectPage")}
            </Button>
            {values.redirectPageId && (
              <Button
                type="button"
                variant="ghost"
                className="mt-2"
                onClick={() => void setFieldValue("redirectPageId", null)}
              >
                {t("pages.clearRedirectPage")}
              </Button>
            )}
          </div>
        </div>
      )}
      {values.redirectTarget === "url" && (
        <Field name="redirectUrl">
          {({ field }: { field: FieldInputProps<string> }) => (
            <FormField label={t("pages.redirectUrl")} id="redirectUrl">
              {(control) => (
                <Input
                  {...control}
                  {...field}
                  value={field.value ?? ""}
                  onChange={(event) =>
                    void setFieldValue(
                      "redirectUrl",
                      event.target.value || null,
                    )
                  }
                  placeholder={t("pages.urlPlaceholder")}
                />
              )}
            </FormField>
          )}
        </Field>
      )}
      <Dialog
        open={props.selectorVisible}
        onOpenChange={props.onSelectorVisibleChange}
        title={t("pages.selectRedirectPage")}
        description={t("pages.redirectPageCatalogDescription")}
        closeLabel={t("common.close")}
      >
        <AssetCatalogTab
          title={t("pages.redirectPageCatalogTitle")}
          description={t("pages.redirectPageCatalogDescription")}
          searchPlaceholder={t("pages.redirectPagePlaceholder")}
          emptyMessage={t("pages.noRedirectPages")}
          items={props.pages}
          total={props.pagesTotal}
          loading={props.pagesLoading}
          selectedId={values.redirectPageId ?? ""}
          search={props.search}
          offset={props.offset}
          limit={props.limit}
          labels={{
            preview: (name) => t("pages.previewOf", { name }),
            select: (name) => t("pages.selectPage", { name }),
            unavailable: t("pages.previewUnavailable"),
            perPage: t("pages.itemsPerPage"),
            page: (page, pages) => t("pages.pageOf", { page, pages }),
            previous: t("tableUi.previous"),
            next: t("tableUi.next"),
          }}
          onSearch={props.onSearch}
          onPage={props.onPage}
          onSelect={(id) => {
            void setFieldValue("redirectPageId", id);
            props.onSelectorVisibleChange(false);
          }}
        />
      </Dialog>
    </div>
  );
}
