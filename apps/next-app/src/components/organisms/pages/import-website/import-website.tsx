"use client";
import { Formik } from "formik";
import {
  importWebsiteSchema,
  type ImportWebsiteInput,
} from "@next-phish/shared";
import { useImportDialog } from "./hooks/use-import-dialog";
import { ImportWebsiteView } from "./parts/import-website-view";
interface Props {
  visible: boolean;
  t: (key: string) => string;
  onImportComplete: (html: string) => void;
  onHide: () => void;
}
export function ImportWebsite({ visible, t, onImportComplete, onHide }: Props) {
  const dialog = useImportDialog({ t, onImportComplete, onHide });
  return (
    <Formik<ImportWebsiteInput>
      initialValues={{ url: dialog.state.url }}
      enableReinitialize
      validate={(values) =>
        importWebsiteSchema.safeParse(values).success
          ? {}
          : { url: t("pages.importUrlInvalid") }
      }
      onSubmit={async (values) => {
        dialog.dispatch({ type: "SET_URL", url: values.url });
        await dialog.handleImport(values.url, dialog.state.includeAssets);
      }}
    >
      <ImportWebsiteView
        visible={visible}
        t={t}
        state={dialog.state}
        previousImports={dialog.previousImports}
        onIncludeAssetsChange={(value) =>
          dialog.dispatch({ type: "SET_INCLUDE_ASSETS", value })
        }
        onSelectPrevious={dialog.handleSelectPrevious}
        onSearch={dialog.handleSearch}
        onHide={dialog.handleHide}
      />
    </Formik>
  );
}
