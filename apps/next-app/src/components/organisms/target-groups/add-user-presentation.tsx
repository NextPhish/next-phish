"use client";
import { Field, Form, useFormikContext } from "formik";
import { Button, Dialog, FormField, FormMessage, Input } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
interface Props {
  visible: boolean;
  onHide: () => void;
  error: string;
}
export function AddUserPresentation({ visible, onHide, error }: Props) {
  const t = useTranslation();
  const { errors, touched, isSubmitting } = useFormikContext<{
    email: string;
    firstName: string;
    lastName: string;
    position: string;
  }>();
  return (
    <Dialog
      open={visible}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onHide();
      }}
      title={t("targetGroups.addUser")}
      description={t("targetGroups.addUserHint")}
      closeLabel={t("common.close")}
      dismissible={!isSubmitting}
      footer={
        <>
          <Button variant="secondary" disabled={isSubmitting} onClick={onHide}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="add-target-user-form"
            loading={isSubmitting}
          >
            {t("common.create")}
          </Button>
        </>
      }
    >
      <Form id="add-target-user-form" noValidate className="grid gap-4">
        {(["email", "firstName", "lastName", "position"] as const).map(
          (name) => (
            <Field name={name} key={name}>
              {({ field }: { field: Record<string, unknown> }) => (
                <FormField
                  id={`add-user-${name}`}
                  label={t(`targetGroups.${name}`)}
                  required={name !== "position"}
                  error={touched[name] ? errors[name] : undefined}
                >
                  {(control) => (
                    <Input
                      {...control}
                      {...field}
                      type={name === "email" ? "email" : "text"}
                      placeholder={
                        name === "position"
                          ? t("targetGroups.positionPlaceholder")
                          : undefined
                      }
                    />
                  )}
                </FormField>
              )}
            </Field>
          ),
        )}
        {error && <FormMessage variant="error">{error}</FormMessage>}
      </Form>
    </Dialog>
  );
}
