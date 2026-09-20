import { beforeEach, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InitialPassword } from "../../../../apps/next-app/src/components/organisms/initial-password";
import { InitialPasswordScreen } from "../../../../apps/next-app/src/components/organisms/initial-password";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";

const mocks = vi.hoisted(() => ({
  setPassword: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    user: {
      setInitialPassword: {
        useMutation: () => ({ mutateAsync: mocks.setPassword }),
      },
    },
  },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.setPassword.mockResolvedValue({ success: true });
});

it("renders the shared authentication layout in English", () => {
  render(
    <I18nProvider initialLocale="en">
      <InitialPasswordScreen>
        <InitialPassword />
      </InitialPasswordScreen>
    </I18nProvider>,
  );
  expect(
    screen.getByRole("heading", { name: "Set your password" }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText(/^New password/)).toBeInTheDocument();
});

it("shows Bulgarian validation and preserves successful redirect behavior", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="bg">
      <InitialPasswordScreen>
        <InitialPassword />
      </InitialPasswordScreen>
    </I18nProvider>,
  );
  await user.click(
    screen.getByRole("button", { name: "Задай парола и продължи" }),
  );
  expect(
    await screen.findByText("Използвайте поне 8 символа."),
  ).toBeInTheDocument();
  expect(screen.getByText("Потвърдете паролата си.")).toBeInTheDocument();
  expect(mocks.setPassword).not.toHaveBeenCalled();

  await user.type(screen.getByLabelText(/^Нова парола/), "secure-password");
  await user.type(
    screen.getByLabelText(/^Потвърдете паролата/),
    "different-password",
  );
  await user.click(
    screen.getByRole("button", { name: "Задай парола и продължи" }),
  );
  expect(screen.getByText("Паролите не съвпадат.")).toBeInTheDocument();
  expect(mocks.setPassword).not.toHaveBeenCalled();

  await user.clear(screen.getByLabelText(/^Потвърдете паролата/));
  await user.type(
    screen.getByLabelText(/^Потвърдете паролата/),
    "secure-password",
  );
  await user.click(
    screen.getByRole("button", { name: "Задай парола и продължи" }),
  );
  expect(mocks.setPassword).toHaveBeenCalledWith({
    password: "secure-password",
    confirmPassword: "secure-password",
  });
  expect(mocks.push).toHaveBeenCalledWith("/");
  expect(mocks.refresh).toHaveBeenCalled();
});
