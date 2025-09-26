'use client'
import { useEffect } from 'react'
import { useAnalytics } from '@prime-growth-os/analytics/provider'

export default function TrackPageView() {
  const { trackPageView } = useAnalytics()
  useEffect(() => { trackPageView() }, [trackPageView])
  return null
}