"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60000,
        retry: false,        // don't retry failed requests — avoids hammering backend on 400/401
        refetchOnWindowFocus: false,  // don't refetch on tab switch — reduces noise
      }
    }
  }));
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
