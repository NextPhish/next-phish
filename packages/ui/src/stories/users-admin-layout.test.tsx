import { expect, it, vi } from "vitest";
import UsersLayout from "../../../../apps/next-app/app/(app)/(org)/users/layout";

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  findUnique: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock("@/src/server/get-required-session", () => ({
  getRequiredSession: mocks.session,
}));
vi.mock("../../../../packages/database/src/client", () => ({
  db: { user: { findUnique: mocks.findUnique } },
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

it("keeps admin-only access and reads the signed-in user's stored role", async () => {
  mocks.session.mockResolvedValue({ user: { id: "session-user" } });
  mocks.findUnique.mockResolvedValue({ role: "admin" });
  const child = <span>Admin content</span>;
  expect(await UsersLayout({ children: child })).toBe(child);
  expect(mocks.findUnique).toHaveBeenCalledWith({
    where: { id: "session-user" },
    select: { role: true },
  });
  expect(mocks.redirect).not.toHaveBeenCalled();
  mocks.findUnique.mockResolvedValue({ role: "user" });
  await UsersLayout({ children: child });
  expect(mocks.redirect).toHaveBeenCalledWith("/");
  mocks.redirect.mockClear();
  mocks.findUnique.mockResolvedValue(null);
  await UsersLayout({ children: child });
  expect(mocks.redirect).toHaveBeenCalledWith("/");
});
