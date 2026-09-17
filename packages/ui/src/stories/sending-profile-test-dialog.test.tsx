import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestEmailDialog } from "../../../../apps/next-app/src/components/organisms/sending-profiles/test-email-dialog";

const mocks = vi.hoisted(() => ({
  payloads: [] as unknown[],
  send: vi.fn().mockResolvedValue({ success: true }),
}));
vi.mock("@/src/lib/i18n", () => ({
  useTranslation: () => (key: string) => key,
}));
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    mailSending: {
      sendTest: {
        useMutation: () => ({
          isPending: false,
          mutateAsync: (input: unknown) => {
            mocks.payloads.push(input);
            return mocks.send(input);
          },
        }),
      },
    },
  },
}));

describe("test email dialog", () => {
  it("validates the recipient and sends only the specified profile and trimmed address", async () => {
    const user = userEvent.setup();
    render(<TestEmailDialog profileId="profile-1" visible onHide={() => {}} />);
    const input = screen.getByRole("textbox", {
      name: /sendingProfiles.testEmailRecipient/,
    });
    await user.type(input, "invalid");
    await user.click(
      screen.getByRole("button", { name: "sendingProfiles.testEmailSend" }),
    );
    expect(mocks.payloads).toEqual([]);
    await user.clear(input);
    await user.type(input, " recipient@example.com ");
    await user.click(
      screen.getByRole("button", { name: "sendingProfiles.testEmailSend" }),
    );
    await waitFor(() =>
      expect(mocks.payloads).toEqual([
        { profileId: "profile-1", toEmail: "recipient@example.com" },
      ]),
    );
  });
});
