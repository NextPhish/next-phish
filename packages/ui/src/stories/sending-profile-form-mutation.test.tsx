import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SendingProfileFormContainer } from "../../../../apps/next-app/src/components/organisms/sending-profiles/sending-profile-form-container";

const mocks = vi.hoisted(() => ({
  create: vi.fn().mockResolvedValue({ id: "profile-1" }),
  update: vi.fn().mockResolvedValue({ id: "profile-1" }),
  push: vi.fn(),
  invalidate: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/src/lib/i18n", () => ({
  useTranslation: () => (key: string) => key,
}));
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      mailSending: {
        list: { invalidate: mocks.invalidate },
        getById: { invalidate: mocks.invalidate },
      },
    }),
    mailSending: {
      getById: {
        useQuery: () => ({
          data: undefined,
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        }),
      },
      create: { useMutation: () => ({ mutateAsync: mocks.create }) },
      update: { useMutation: () => ({ mutateAsync: mocks.update }) },
      sendTest: {
        useMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
      },
    },
  },
}));

describe("sending profile form mutation", () => {
  beforeEach(() => {
    mocks.create.mockReset().mockResolvedValue({ id: "profile-1" });
    mocks.push.mockClear();
  });
  async function fill(user: ReturnType<typeof userEvent.setup>) {
    await user.type(
      screen.getByRole("textbox", { name: /sendingProfiles.name/ }),
      "Primary mail",
    );
    await user.click(
      screen.getByRole("combobox", { name: /sendingProfiles.providerType/ }),
    );
    await user.click(screen.getByRole("option", { name: "SMTP" }));
    await user.type(
      screen.getByRole("textbox", { name: /sendingProfiles.fromName/ }),
      "Security",
    );
    await user.type(
      screen.getByRole("textbox", { name: /sendingProfiles.fromEmail/ }),
      "security@example.com",
    );
    await user.type(
      screen.getByRole("textbox", { name: /sendingProfiles.smptHost/ }),
      "smtp.example.com",
    );
  }
  it("awaits the create payload and navigates only after success", async () => {
    const user = userEvent.setup();
    render(<SendingProfileFormContainer />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: "common.create" }));
    await waitFor(() =>
      expect(mocks.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Primary mail",
          providerType: "SMTP",
          fromEmail: "security@example.com",
          providerConfig: expect.objectContaining({ host: "smtp.example.com" }),
        }),
      ),
    );
    expect(mocks.push).toHaveBeenCalledWith("/sending-profiles");
  });
  it("shows a failed save and stays on the form", async () => {
    mocks.create.mockRejectedValueOnce(new Error("unavailable"));
    const user = userEvent.setup();
    render(<SendingProfileFormContainer />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: "common.create" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "sendingProfiles.createError",
      ),
    );
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
