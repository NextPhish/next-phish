import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMyOrganizations } from "../../../../apps/next-app/src/components/organisms/app-shell/hooks/use-my-organizations";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";

const mocks = vi.hoisted(() => ({
  setActive: vi.fn(),
  refresh: vi.fn(),
  invalidate: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

vi.mock("@/src/lib/auth-client", () => ({
  authClient: {
    useActiveOrganization: () => ({ data: null }),
    organization: { setActive: mocks.setActive },
  },
}));

vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      organization: { list: { invalidate: mocks.invalidate } },
    }),
    organization: {
      list: {
        useQuery: () => ({
          data: { organizations: [], total: 0 },
          isLoading: false,
        }),
      },
      create: { useMutation: () => ({ mutateAsync: vi.fn() }) },
    },
  },
}));

function Wrapper({ children }: { children: ReactNode }) {
  return <I18nProvider initialLocale="bg">{children}</I18nProvider>;
}

describe("useMyOrganizations organization switching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refreshes the route after a successful switch", async () => {
    mocks.setActive.mockResolvedValue({ data: {}, error: null });
    const { result } = renderHook(() => useMyOrganizations(), {
      wrapper: Wrapper,
    });

    await act(() => result.current.setActive("org-2"));

    expect(mocks.setActive).toHaveBeenCalledWith({ organizationId: "org-2" });
    expect(mocks.refresh).toHaveBeenCalledOnce();
    expect(result.current.switchError).toBe("");
    expect(result.current.isSwitching).toBe(false);
  });

  it("surfaces a localized resolved Better Auth error without refreshing", async () => {
    mocks.setActive.mockResolvedValue({
      data: null,
      error: { message: "server error" },
    });
    const { result } = renderHook(() => useMyOrganizations(), {
      wrapper: Wrapper,
    });

    let failure: unknown;
    await act(async () => {
      try {
        await result.current.setActive("org-2");
      } catch (error) {
        failure = error;
      }
    });

    expect(failure).toEqual(
      new Error("Неуспешна смяна на организацията. Опитайте отново."),
    );
    expect(mocks.refresh).not.toHaveBeenCalled();
    expect(result.current.switchError).toBe(
      "Неуспешна смяна на организацията. Опитайте отново.",
    );
    expect(result.current.isSwitching).toBe(false);
  });

  it("ignores a duplicate switch while the first request is pending", async () => {
    let resolveSwitch!: (value: { data: object; error: null }) => void;
    mocks.setActive.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSwitch = resolve;
        }),
    );
    const { result } = renderHook(() => useMyOrganizations(), {
      wrapper: Wrapper,
    });

    let first!: Promise<void>;
    await act(async () => {
      first = result.current.setActive("org-2");
      await result.current.setActive("org-3");
    });

    expect(mocks.setActive).toHaveBeenCalledOnce();
    expect(result.current.isSwitching).toBe(true);

    await act(async () => {
      resolveSwitch({ data: {}, error: null });
      await first;
    });

    expect(mocks.refresh).toHaveBeenCalledOnce();
    expect(result.current.isSwitching).toBe(false);
  });
});
