"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { useState } from "react"
import { WalletProvider } from "@/lib/context/WalletContext"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { initWebVitals } from "@/lib/monitoring/webVitals"
import { logger } from "@/lib/logger"

if (typeof window !== "undefined") {
  try {
    initWebVitals()
  } catch (e) {
    logger.debug("[Providers] Web Vitals init failed:", e)
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <WalletProvider>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WalletProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
