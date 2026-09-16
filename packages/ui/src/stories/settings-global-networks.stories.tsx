import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Formik } from "formik";
import type { IgnoredNetworkInput } from "@next-phish/shared";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { GlobalIgnoredNetworksPresentation } from "../../../../apps/next-app/src/components/organisms/settings/global-ignored-networks-presentation";
import { PageHeader } from "../index";

const networks = [
  {
    id: "global-1",
    network: "10.20.0.0/16",
    normalizedNetwork: "10.20.0.0/16",
    description: "Shared scanner network",
    createdAt: new Date("2026-09-10T09:00:00Z"),
  },
  {
    id: "global-2",
    network: "192.0.2.24",
    normalizedNetwork: "192.0.2.24/32",
    description: "Mail gateway",
    createdAt: new Date("2026-09-12T11:30:00Z"),
  },
];
function Preview({
  state = "populated",
}: {
  state?: "populated" | "loading" | "errors";
}) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string>();
  return (
    <I18nProvider initialLocale="en">
      <div className="np-theme" style={{ maxWidth: 980, margin: "2rem auto" }}>
        <PageHeader
          title="Application settings"
          description="Global application policies and trusted network exclusions."
        />
        <Formik<IgnoredNetworkInput>
          initialValues={{ network: "", description: "" }}
          initialErrors={
            state === "errors"
              ? { network: "IP address or network is required" }
              : undefined
          }
          initialTouched={state === "errors" ? { network: true } : undefined}
          onSubmit={() => undefined}
        >
          <GlobalIgnoredNetworksPresentation
            networks={networks}
            title="Global ignored IP addresses and networks"
            hint="Events from these IP addresses or CIDR networks are ignored across every organization."
            isLoading={state === "loading"}
            status={
              state === "errors"
                ? {
                    type: "error",
                    message: "Failed to add the global ignored network.",
                  }
                : { type: "idle", message: "" }
            }
            pendingDeleteId={pendingDeleteId}
            onDelete={async () => undefined}
            onRequestDelete={setPendingDeleteId}
            onCancelDelete={() => setPendingDeleteId(undefined)}
            onRetry={() => undefined}
          />
        </Formik>
      </div>
    </I18nProvider>
  );
}
const meta = {
  title: "Screens/Admin settings/Global ignored networks",
  component: Preview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Preview>;
export default meta;
export const Populated: StoryObj<typeof meta> = {};
export const Loading: StoryObj<typeof meta> = { args: { state: "loading" } };
export const FormErrors: StoryObj<typeof meta> = { args: { state: "errors" } };
