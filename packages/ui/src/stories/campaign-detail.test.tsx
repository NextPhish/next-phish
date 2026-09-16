import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CampaignDetailPresentation } from "../../../../apps/next-app/src/components/organisms/campaigns/detail-presentation";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";

function setup(type: "TEMPLATE" | "CONCRETE") {
  const Statistics = vi.fn(() => <p>Statistics content</p>);
  const Recipients = vi.fn(() => <p>Recipients content</p>);
  render(
    <I18nProvider initialLocale="en">
      <CampaignDetailPresentation
        name="Awareness campaign"
        type={type}
        status="PUBLISHED"
        statusLabel="Published"
        statusTone="success"
        savedMessage=""
        actionStatus={{ type: "idle", message: "" }}
        pending={{
          publish: false,
          pause: false,
          resume: false,
          complete: false,
          clone: false,
          delete: false,
        }}
        deleteOpen={false}
        onDeleteOpenChange={vi.fn()}
        onAction={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onSchedule={vi.fn()}
        overview={<p>Overview content</p>}
        statistics={<Statistics />}
        recipients={<Recipients />}
      />
    </I18nProvider>,
  );
  return { Statistics, Recipients };
}

it("shows only the overview for templates and never mounts reporting components", () => {
  const { Statistics, Recipients } = setup("TEMPLATE");
  expect(screen.getByText("Overview content")).toBeVisible();
  expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  expect(Statistics).not.toHaveBeenCalled();
  expect(Recipients).not.toHaveBeenCalled();
});

it("preserves statistics and recipients tabs for concrete campaigns", async () => {
  const user = userEvent.setup();
  setup("CONCRETE");
  expect(screen.getByText("Overview content")).toBeVisible();
  await user.click(screen.getByRole("tab", { name: "Statistics" }));
  expect(screen.getByText("Statistics content")).toBeVisible();
  await user.click(screen.getByRole("tab", { name: "Recipients" }));
  expect(screen.getByText("Recipients content")).toBeVisible();
});
