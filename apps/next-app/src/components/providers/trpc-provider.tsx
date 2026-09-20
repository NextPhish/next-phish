"use client";

import { useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  httpBatchLink,
  httpSubscriptionLink,
  splitLink,
} from "@trpc/react-query";
import { trpc } from "@/src/lib/trpc";
import { authClient } from "@/src/lib/auth-client";
import superjson from "superjson";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

function ScopedTRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        splitLink({
          condition: (op) => op.type === "subscription",
          true: httpSubscriptionLink({
            url: `${getBaseUrl()}/api/trpc`,
            transformer: superjson,
          }),
          false: httpBatchLink({
            url: `${getBaseUrl()}/api/trpc`,
            transformer: superjson,
          }),
        }),
      ],
    }),
  );
  const lifecycle = useRef(0);

  useEffect(() => {
    const generation = ++lifecycle.current;
    return () => {
      queueMicrotask(() => {
        if (lifecycle.current !== generation) return;
        void queryClient.cancelQueries();
        queryClient.clear();
      });
    };
  }, [queryClient]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const session = authClient.useSession();
  const activeOrganization = authClient.useActiveOrganization();
  const userId = session.data?.user.id ?? "anonymous";
  const organizationId = activeOrganization.data?.id ?? "none";

  return (
    <ScopedTRPCProvider key={`${userId}:${organizationId}`}>
      {children}
    </ScopedTRPCProvider>
  );
}
