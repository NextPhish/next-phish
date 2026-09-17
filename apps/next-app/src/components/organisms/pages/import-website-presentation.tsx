"use client";
import { Form } from "formik";
import { Button, Dialog, FormMessage } from "@next-phish/ui";
import type {
  ImportState,
  PreviousImport,
} from "@/src/hooks/use-import-dialog";
import { AssetsToggle } from "./assets-toggle";
import { ImportProgressView } from "./import-progress-view";
import { ImportUrlField } from "./import-url-field";
import { PreviousImportsList } from "./previous-imports-list";
interface Props {
  visible: boolean;
  t: (key: string) => string;
  state: ImportState;
  previousImports: PreviousImport[];
  onIncludeAssetsChange: (value: boolean) => void;
  onSelectPrevious: (value: PreviousImport) => void;
  onSearch: (value: string) => void;
  onHide: () => void;
}
export function ImportWebsitePresentation(props: Props) {
  const footer = (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={props.onHide}
        disabled={props.state.importing}
      >
        {props.t("common.cancel")}
      </Button>
      {!props.state.jobId && (
        <Button
          type="submit"
          form="import-form"
          loading={props.state.importing}
          disabled={props.state.importing}
        >
          {props.t("pages.importWebsiteButton")}
        </Button>
      )}
    </>
  );
  return (
    <Dialog
      title={props.t("pages.importWebsiteTitle")}
      description={props.t("pages.importWebsiteHint")}
      closeLabel={props.t("common.close")}
      open={props.visible}
      onOpenChange={(open) => {
        if (!open) props.onHide();
      }}
      footer={footer}
      dismissible={!props.state.importing}
    >
      {!props.state.jobId ? (
        <>
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3">
            <p className="text-xs leading-relaxed text-amber-900">
              {props.t("pages.importWebsiteWarning")}
            </p>
          </div>
          <Form id="import-form" className="space-y-4">
            <ImportUrlField t={props.t} />
            <AssetsToggle
              checked={props.state.includeAssets}
              t={props.t}
              onChange={props.onIncludeAssetsChange}
            />
          </Form>
          <PreviousImportsList
            imports={props.previousImports}
            t={props.t}
            onSelect={props.onSelectPrevious}
            onSearch={props.onSearch}
          />
          {props.state.error && (
            <FormMessage variant="error">{props.state.error}</FormMessage>
          )}
        </>
      ) : (
        <ImportProgressView progress={props.state.progress} t={props.t} />
      )}
    </Dialog>
  );
}
