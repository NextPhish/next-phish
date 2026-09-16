import { expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  findUser: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@next-phish/database", () => ({
  db: { user: { findUnique: mocks.findUser } },
}));
vi.mock("../../../../packages/database/src/client", () => ({
  db: { user: { findUnique: mocks.findUser } },
}));
vi.mock("@/src/server/get-required-session", () => ({
  getRequiredSession: mocks.getSession,
}));
import SettingsLayout from "../../../../apps/next-app/app/(app)/(org)/settings/layout";

it("keeps the admin-only settings layout guard", async () => {
  mocks.getSession.mockResolvedValue({ user: { id: "user-1" } });
  mocks.findUser.mockResolvedValueOnce({ role: "admin" });
  expect(await SettingsLayout({ children: "settings" })).toBe("settings");
  expect(mocks.findUser).toHaveBeenCalledWith({
    where: { id: "user-1" },
    select: { role: true },
  });
  mocks.findUser.mockResolvedValueOnce({ role: "user" });
  await SettingsLayout({ children: "settings" });
  expect(mocks.redirect).toHaveBeenCalledWith("/");
});
