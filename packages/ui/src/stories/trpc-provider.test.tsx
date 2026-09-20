import { StrictMode, type ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useQuery } from "../../../../apps/next-app/node_modules/@tanstack/react-query";
import { beforeEach, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ userId: "user-1", organizationId: "org-a" }));

vi.mock("@/src/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({ data: { user: { id: auth.userId } } }),
    useActiveOrganization: () => ({ data: { id: auth.organizationId } }),
  },
}));

vi.mock("@/src/lib/trpc", async () => {
  const { QueryClientProvider } =
    await import("../../../../apps/next-app/node_modules/@tanstack/react-query");
  return {
    trpc: {
      createClient: () => ({}),
      Provider: ({
        children,
        queryClient,
      }: {
        children: ReactNode;
        queryClient: Parameters<typeof QueryClientProvider>[0]["client"];
      }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    },
  };
});

import { TRPCProvider } from "../../../../apps/next-app/src/components/providers/trpc-provider";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function OrganizationValue({
  load,
}: {
  load: (organizationId: string) => Promise<string>;
}) {
  const organizationId = auth.organizationId;
  const query = useQuery({
    queryKey: ["implicit-organization-query"],
    queryFn: () => load(organizationId),
  });
  return <output>{query.data ?? "loading"}</output>;
}

beforeEach(() => {
  auth.userId = "user-1";
  auth.organizationId = "org-a";
});

it("preserves cache within one organization and creates a fresh cache for every switch", async () => {
  const loads = vi.fn(
    async (organizationId: string) => `${organizationId}-data`,
  );
  const view = render(
    <TRPCProvider>
      <OrganizationValue load={loads} />
    </TRPCProvider>,
  );
  expect(await screen.findByText("org-a-data")).toBeInTheDocument();
  view.rerender(
    <TRPCProvider>
      <OrganizationValue load={loads} />
    </TRPCProvider>,
  );
  expect(loads).toHaveBeenCalledTimes(1);

  auth.organizationId = "org-b";
  view.rerender(
    <TRPCProvider>
      <OrganizationValue load={loads} />
    </TRPCProvider>,
  );
  expect(await screen.findByText("org-b-data")).toBeInTheDocument();

  auth.organizationId = "org-a";
  view.rerender(
    <TRPCProvider>
      <OrganizationValue load={loads} />
    </TRPCProvider>,
  );
  expect(await screen.findByText("org-a-data")).toBeInTheDocument();
  expect(loads).toHaveBeenCalledTimes(3);
});

it("does not let a late response from the previous organization populate the active cache", async () => {
  const pendingA = deferred<string>();
  const pendingB = deferred<string>();
  const load = vi.fn((organizationId: string) =>
    organizationId === "org-a" ? pendingA.promise : pendingB.promise,
  );
  const view = render(
    <TRPCProvider>
      <OrganizationValue load={load} />
    </TRPCProvider>,
  );
  await waitFor(() => expect(load).toHaveBeenCalledWith("org-a"));

  auth.organizationId = "org-b";
  view.rerender(
    <TRPCProvider>
      <OrganizationValue load={load} />
    </TRPCProvider>,
  );
  await waitFor(() => expect(load).toHaveBeenCalledWith("org-b"));
  pendingA.resolve("late-org-a-data");
  await Promise.resolve();
  expect(screen.queryByText("late-org-a-data")).not.toBeInTheDocument();

  pendingB.resolve("org-b-data");
  expect(await screen.findByText("org-b-data")).toBeInTheDocument();
});

it("does not clear the active organization cache during StrictMode effect replay", async () => {
  const load = vi.fn(async () => "org-a-data");
  const view = render(
    <StrictMode>
      <TRPCProvider>
        <OrganizationValue load={load} />
      </TRPCProvider>
    </StrictMode>,
  );
  expect(await screen.findByText("org-a-data")).toBeInTheDocument();
  await Promise.resolve();
  view.rerender(
    <StrictMode>
      <TRPCProvider>
        <OrganizationValue load={load} />
      </TRPCProvider>
    </StrictMode>,
  );
  expect(screen.getByText("org-a-data")).toBeInTheDocument();
  expect(load).toHaveBeenCalledTimes(1);
});

it("creates a fresh cache when the signed-in user changes within the same organization", async () => {
  const load = vi.fn(async () => `${auth.userId}-data`);
  const view = render(
    <TRPCProvider>
      <OrganizationValue load={load} />
    </TRPCProvider>,
  );
  expect(await screen.findByText("user-1-data")).toBeInTheDocument();
  auth.userId = "user-2";
  view.rerender(
    <TRPCProvider>
      <OrganizationValue load={load} />
    </TRPCProvider>,
  );
  expect(await screen.findByText("user-2-data")).toBeInTheDocument();
  expect(load).toHaveBeenCalledTimes(2);
});
