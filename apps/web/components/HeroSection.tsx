'use client'

import { Button } from '@ui/components/button'
import { ArrowRight } from 'lucide-react'
import { useGAEvent } from '@analytics/provider'
import { siteContent } from '@content/copy'

export default function HeroSection() {
  const trackEvent = useGAEvent()

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_click', { source: 'home_hero' })
    window.open(process.env.NEXT_PUBLIC_WHATSAPP_LINK || 'https://wa.me/5215512345678', '_blank')
  }

  const handleDemoClick = () => {
    trackEvent('demo_request', { source: 'home_hero' })
    window.open(process.env.NEXT_PUBLIC_BOOKING_URL || 'https://calendly.com/prime-growth', '_blank')
  }

  return (
    <section className="section-padding relative overflow-hidden bg-gradient-to-b from-stone-50 to-white">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {siteContent.hero.headline}
          </h1>
          <p className="mb-8 text-lg text-stone-600 sm:text-xl">
            {siteContent.hero.subheadline}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" variant="gold" onClick={handleDemoClick}>
              {siteContent.hero.cta.primary}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={handleWhatsAppClick}>
              {siteContent.hero.cta.secondary}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}