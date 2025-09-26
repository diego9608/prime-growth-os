'use client'
import { AnalyticsProvider } from '@prime-growth-os/analytics/provider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AnalyticsProvider>{children}</AnalyticsProvider>
}