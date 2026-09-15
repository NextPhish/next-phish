import type { Meta, StoryObj } from "@storybook/react-vite";
import { Formik } from "formik";
import type {
  IgnoredNetworkInput,
  UpdateOrganizationInput,
} from "@next-phish/shared";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { GeneralFormPresentation } from "../../../../apps/next-app/src/components/organisms/organization-settings/general-form-presentation";
import { IgnoredNetworksPresentation } from "../../../../apps/next-app/src/components/organisms/organization-settings/ignored-networks-presentation";

const networks = [
  {
    id: "network-1",
    network: "10.20.0.0/16",
    normalizedNetwork: "10.20.0.0/16",
    description: "Head office and VPN",
    createdAt: new Date("2026-09-10T09:00:00Z"),
  },
  {
    id: "network-2",
    network: "192.0.2.24",
    normalizedNetwork: "192.0.2.24/32",
    description: null,
    createdAt: new Date("2026-09-12T11:30:00Z"),
  },
];

function Preview({
  locale = "en",
  view = "general",
  loading = false,
  empty = false,
}: {
  locale?: "en" | "bg";
  view?: "general" | "networks";
  loading?: boolean;
  empty?: boolean;
}) {
  return (
    <I18nProvider initialLocale={locale}>
      <div className="np-theme" style={{ maxWidth: 920, margin: "2rem auto" }}>
        {view === "general" ? (
          <Formik<UpdateOrganizationInput>
            initialValues={{ name: "Acme Security", slug: "acme-security" }}
            onSubmit={() => undefined}
          >
            <GeneralFormPresentation status={{ type: "idle", message: "" }} />
          </Formik>
        ) : (
          <Formik<IgnoredNetworkInput>
            initialValues={{ network: "", description: "" }}
            onSubmit={() => undefined}
          >
            <IgnoredNetworksPresentation
              networks={empty ? [] : networks}
              isLoading={loading}
              status={{ type: "idle", message: "" }}
              onDelete={async () => undefined}
              onRequestDelete={() => undefined}
              onCancelDelete={() => undefined}
              onRetry={() => undefined}
            />
          </Formik>
        )}
      </div>
    </I18nProvider>
  );
}

const meta = {
  title: "Application/Organization settings",
  component: Preview,
} satisfies Meta<typeof Preview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const General: Story = {};
export const IgnoredNetworks: Story = { args: { view: "networks" } };
export const EmptyNetworks: Story = {
  args: { view: "networks", empty: true },
};
export const LoadingNetworks: Story = {
  args: { view: "networks", loading: true },
};
export const Bulgarian: Story = { args: { view: "networks", locale: "bg" } };
