import { useId } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Formik, Form, Field, useFormikContext, type FieldProps } from "formik";
import {
  createOrganizationSchema,
  type CreateOrganizationInput,
} from "@next-phish/shared";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  FormField,
  Input,
  FormMessage,
  FormErrorSummary,
} from "../index";

function OrganizationFormPresentation({ busy }: { busy: boolean }) {
  const { errors, touched, submitCount, isSubmitting, status } =
    useFormikContext<CreateOrganizationInput>();
  const id = useId();
  const fields = [
    { name: "name" as const, label: "Organization name" },
    { name: "slug" as const, label: "Slug" },
  ];
  const issues = fields
    .filter(({ name }) => errors[name] && (touched[name] || submitCount > 0))
    .map(({ name }) => ({ id: `${id}-${name}`, message: errors[name]! }));
  const result = status as
    | { type: "error" | "success"; message: string }
    | undefined;
  return (
    <Form noValidate>
      <Card>
        <CardHeader
          title="Organization settings"
          description="Formik + the existing shared Zod schema. Local submission only."
        />
        <CardBody>
          <div className="grid gap-5">
            <FormErrorSummary errors={issues} />
            {result && (
              <FormMessage variant={result.type}>{result.message}</FormMessage>
            )}
            {fields.map(({ name, label }) => (
              <FormField
                key={name}
                id={`${id}-${name}`}
                label={label}
                required
                error={
                  errors[name] && (touched[name] || submitCount > 0)
                    ? errors[name]
                    : undefined
                }
              >
                {(props) => (
                  <Field name={name}>
                    {({ field }: FieldProps<string>) => (
                      <Input
                        {...field}
                        {...props}
                        disabled={busy || isSubmitting}
                      />
                    )}
                  </Field>
                )}
              </FormField>
            ))}
          </div>
        </CardBody>
        <CardFooter>
          <Button type="submit" loading={busy || isSubmitting}>
            Save organization
          </Button>
        </CardFooter>
      </Card>
    </Form>
  );
}
function OrganizationForm({
  fail = false,
  busy = false,
}: {
  fail?: boolean;
  busy?: boolean;
}) {
  return (
    <div style={{ maxWidth: 580 }}>
      <Formik
        initialValues={{ name: "", slug: "" }}
        validate={(values) => {
          const result = createOrganizationSchema.safeParse(values);
          return result.success
            ? {}
            : Object.fromEntries(
                result.error.issues.map((issue) => [
                  issue.path.join("."),
                  issue.message,
                ]),
              );
        }}
        onSubmit={async (_values, helpers) => {
          helpers.setStatus(undefined);
          await Promise.resolve();
          helpers.setStatus(
            fail
              ? {
                  type: "error",
                  message:
                    "Could not save the organization. Your entries are preserved; try again.",
                }
              : {
                  type: "success",
                  message: "Organization saved in this local demonstration.",
                },
          );
        }}
      >
        <OrganizationFormPresentation busy={busy} />
      </Formik>
    </div>
  );
}
const meta = {
  title: "Organisms/Organization form",
  component: OrganizationForm,
} satisfies Meta<typeof OrganizationForm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ValidationAndSuccess: Story = {};
export const ServerFailure: Story = { args: { fail: true } };
export const Submitting: Story = { args: { busy: true } };
