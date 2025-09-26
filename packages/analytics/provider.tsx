'use client'
import React, {createContext, useContext, useEffect} from 'react'

type Ctx = {
  trackEvent: (name: string, params?: Record<string, any>) => void
  trackPageView: (path?: string) => void
}
const noop: Ctx = { trackEvent: () => {}, trackPageView: () => {} }
const AnalyticsContext = createContext<Ctx | null>(null)

type Gtag =
  | ((cmd: 'js', date: Date) => void)
  | ((cmd: 'config', id: string, params?: Record<string, any>) => void)
  | ((cmd: 'event', action: string, params?: Record<string, any>) => void)

declare global { interface Window { dataLayer: any[]; gtag: Gtag } }

const GA = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.dataLayer = window.dataLayer || []
    if (!window.gtag) {
      window.gtag = ((...args: any[]) => window.dataLayer.push(args)) as Gtag
    }
    window.gtag('js', new Date())
    if (GA) window.gtag('config', GA)
  }, [])

  const value: Ctx = {
    trackEvent: (name, params) => { if (GA && typeof window !== 'undefined') window.gtag('event', name, params) },
    trackPageView: (path) => { if (GA && typeof window !== 'undefined') window.gtag('event', 'page_view', { page_path: path ?? window.location.pathname }) },
  }
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalytics(): Ctx {
  const ctx = useContext(AnalyticsContext)
  return ctx ?? noop
}
export const useGAEvent = () => useAnalytics().trackEvent