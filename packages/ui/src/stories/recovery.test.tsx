import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordContainer } from "../../../../apps/next-app/src/components/organisms/reset-password/container";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
const auth = vi.hoisted(() => ({
  checkVerificationOtp: vi.fn(),
  resetPassword: vi.fn(),
  push: vi.fn(),
}));
vi.mock("@/src/lib/auth-client", () => ({ authClient: { emailOtp: auth } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: auth.push }) }));

it("requires OTP verification, initializes the password form, and blocks mismatched passwords", async () => {
  auth.checkVerificationOtp
    .mockResolvedValueOnce({ error: { message: "English backend error" } })
    .mockResolvedValueOnce({ error: null });
  auth.resetPassword.mockResolvedValue({ error: null });
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="bg">
      <ResetPasswordContainer email="preview@example.test" />
    </I18nProvider>,
  );
  await user.type(screen.getByLabelText(/Код за потвърждение/), "123456");
  await user.click(screen.getByRole("button", { name: "Потвърди кода" }));
  expect(
    await screen.findByText("Невалиден или изтекъл код"),
  ).toBeInTheDocument();
  expect(screen.queryByText("English backend error")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Потвърди кода" }));
  const password = await screen.findByLabelText(/^Нова парола/);
  expect(password).toHaveValue("");
  await user.type(password, "new-test-password");
  const confirmation = screen.getByLabelText(/^Потвърдете новата парола/);
  await user.type(confirmation, "different-password");
  await user.click(screen.getByRole("button", { name: "Нулирай паролата" }));
  expect(auth.resetPassword).not.toHaveBeenCalled();
  await user.clear(confirmation);
  await user.type(confirmation, "new-test-password");
  await user.click(screen.getByRole("button", { name: "Нулирай паролата" }));
  expect(auth.resetPassword).toHaveBeenCalledWith({
    email: "preview@example.test",
    otp: "123456",
    password: "new-test-password",
  });
  expect(auth.push).toHaveBeenCalledWith("/login?message=password-reset");
});
