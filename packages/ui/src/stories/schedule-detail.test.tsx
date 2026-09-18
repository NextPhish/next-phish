import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { ScheduleDetailContent } from "../../../../apps/next-app/src/components/organisms/schedules/schedule-detail-content";
import { populatedSchedule } from "./schedule-detail.stories";

it("renders generated campaigns and delegates campaign navigation", async () => {
  const user = userEvent.setup();
  const onNavigate = vi.fn();
  render(
    <I18nProvider initialLocale="en">
      <ScheduleDetailContent data={populatedSchedule} onNavigate={onNavigate} />
    </I18nProvider>,
  );

  expect(screen.getByText("September awareness")).toBeInTheDocument();
  expect(screen.getByText("June awareness")).toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "Actions: September awareness" }),
  );
  await user.click(screen.getByRole("menuitem", { name: "View campaign" }));
  expect(onNavigate).toHaveBeenCalledWith("/campaigns/campaign-september");
});
