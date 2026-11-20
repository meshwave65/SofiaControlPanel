import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import { supabase } from "./lib/supabase";
import { recordAuthDiagnostic, getAuthDiagnosticCorrelationId, isAuthDiagnosticEnabled } from "./lib/authDiagnostics";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      async fetch(input, init) {
        const startedAt = Date.now();
        const requestUrl = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const isAuthMe = requestUrl.includes("auth.me");
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();
          if (isAuthMe) {
            recordAuthDiagnostic("backend.auth.me.request", {
              sessionPresent: Boolean(session?.access_token),
              sessionExpired: session?.expires_at ? session.expires_at * 1000 <= Date.now() : null,
              sessionReadError: error?.name ?? null,
            });
          }
          const headers = new Headers(init?.headers);
          if (session?.access_token) {
            headers.set("Authorization", `Bearer ${session.access_token}`);
          }
          if (isAuthMe && isAuthDiagnosticEnabled()) {
            headers.set("X-SCP-Auth-Diagnostic", getAuthDiagnosticCorrelationId());
          }
          const response = await globalThis.fetch(input, {
            ...(init ?? {}),
            headers,
            credentials: "include",
          });
          if (isAuthMe) {
            recordAuthDiagnostic("backend.auth.me.response", {
              httpStatus: response.status,
              durationMs: Date.now() - startedAt,
              ok: response.ok,
            });
          }
          return response;
        } catch (error) {
          if (isAuthMe) {
            recordAuthDiagnostic("backend.auth.me.network_error", {
              durationMs: Date.now() - startedAt,
              errorName: error instanceof Error ? error.name : "UnknownError",
            });
          }
          throw error;
        }
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
