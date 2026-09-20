import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SendingProfileForm } from "../../../../apps/next-app/src/components/organisms/sending-profiles";

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
    mocks.invalidate.mockReset().mockResolvedValue(undefined);
  });
  async function fill(user: ReturnType<typeof userEvent.setup>) {
    // This tests submission, not individual keystrokes. Paste avoids dozens of
    // Formik validations/renders competing for CPU on the CI runner.
    await user.click(
      screen.getByRole("textbox", { name: /sendingProfiles.name/ }),
    );
    await user.paste("Primary mail");
    await user.click(
      screen.getByRole("combobox", { name: /sendingProfiles.providerType/ }),
    );
    await user.click(screen.getByRole("option", { name: "SMTP" }));
    await user.click(
      screen.getByRole("textbox", { name: /sendingProfiles.fromName/ }),
    );
    await user.paste("Security");
    await user.click(
      screen.getByRole("textbox", { name: /sendingProfiles.fromEmail/ }),
    );
    await user.paste("security@example.com");
    await user.click(
      screen.getByRole("textbox", { name: /sendingProfiles.smptHost/ }),
    );
    await user.paste("smtp.example.com");
  }
  it("awaits the create payload and navigates only after success", async () => {
    let resolveCreate!: (value: { id: string }) => void;
    let resolveInvalidation!: () => void;
    const creating = new Promise<{ id: string }>((resolve) => {
      resolveCreate = resolve;
    });
    const invalidating = new Promise<void>((resolve) => {
      resolveInvalidation = resolve;
    });
    mocks.create.mockReturnValueOnce(creating);
    mocks.invalidate.mockReturnValueOnce(invalidating);
    const user = userEvent.setup();
    render(<SendingProfileForm />);
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
    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(mocks.invalidate).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
    await act(async () => {
      resolveCreate({ id: "profile-1" });
      await creating;
    });
    await waitFor(() => expect(mocks.invalidate).toHaveBeenCalledTimes(1));
    expect(mocks.push).not.toHaveBeenCalled();
    await act(async () => {
      resolveInvalidation();
      await invalidating;
    });
    await waitFor(() =>
      expect(mocks.push).toHaveBeenCalledWith("/sending-profiles"),
    );
  });
  it("shows a failed save and stays on the form", async () => {
    mocks.create.mockRejectedValueOnce(new Error("unavailable"));
    const user = userEvent.setup();
    render(<SendingProfileForm />);
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
