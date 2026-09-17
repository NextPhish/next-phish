import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  FormMessage,
  FormErrorSummary,
  Button,
  Card,
  CardBody,
  FormField,
  Input,
} from "../index";
const meta = {
  title: "Molecules/Form states",
  component: FormMessage,
  args: {
    variant: "error",
    title: "We could not save your changes",
    children:
      "Your changes are still here. Check your connection and try again.",
  },
} satisfies Meta<typeof FormMessage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ServerError: Story = {
  args: { action: <Button variant="secondary">Try again</Button> },
};
export const Success: Story = {
  args: {
    variant: "success",
    title: "Changes saved",
    children: "Your organization settings have been updated.",
  },
};
export const Information: Story = {
  args: {
    variant: "info",
    title: "Unsaved changes",
    children: "Review the form before saving.",
  },
};
export const ValidationErrors: Story = {
  render: () => (
    <Card>
      <CardBody>
        <div className="grid gap-5 max-w-lg">
          <FormErrorSummary
            errors={[
              { id: "error-name", message: "Enter an organization name." },
              {
                id: "error-slug",
                message: "Use lowercase letters, numbers and hyphens.",
              },
            ]}
          />
          <FormField
            id="error-name"
            label="Organization name"
            error="Enter an organization name."
          >
            {(props) => <Input {...props} />}
          </FormField>
          <FormField
            id="error-slug"
            label="Slug"
            error="Use lowercase letters, numbers and hyphens."
          >
            {(props) => <Input {...props} defaultValue="Invalid slug!" />}
          </FormField>
        </div>
      </CardBody>
    </Card>
  ),
};
