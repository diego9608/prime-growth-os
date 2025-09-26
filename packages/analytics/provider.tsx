'use client'

import React, { createContext, useContext, useEffect } from 'react'
import Script from 'next/script'

interface AnalyticsContextType {
  trackEvent: (eventName: string, parameters?: Record<string, any>) => void
  trackPageView: (url: string) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

interface AnalyticsProviderProps {
  children: React.ReactNode
  measurementId?: string
}

declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
    dataLayer: any[]
  }
}

export function AnalyticsProvider({ children, measurementId }: AnalyticsProviderProps) {
  const GA_MEASUREMENT_ID = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters)
    }
  }

  const trackPageView = (url: string) => {
    if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
      })
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.gtag) {
      window.dataLayer = window.dataLayer || []
      window.gtag = function gtag() {
        window.dataLayer.push(arguments)
      }
      window.gtag('js', new Date())
      if (GA_MEASUREMENT_ID) {
        window.gtag('config', GA_MEASUREMENT_ID)
      }
    }
  }, [GA_MEASUREMENT_ID])

  if (!GA_MEASUREMENT_ID) {
    return <>{children}</>
  }

  return (
    <AnalyticsContext.Provider value={{ trackEvent, trackPageView }}>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}

export function useGAEvent() {
  const { trackEvent } = useAnalytics()
  return trackEvent
}