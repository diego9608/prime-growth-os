'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, TrendingUp, Users, Zap } from 'lucide-react'
import { Button } from '@ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/components/card'
import { siteContent } from '@content/copy'
import { useGAEvent } from '@analytics/provider'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function HomePage() {
  const trackEvent = useGAEvent()

  useEffect(() => {
    trackEvent('view_home')
  }, [trackEvent])

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_click', { source: 'home_hero' })
    window.open(process.env.NEXT_PUBLIC_WHATSAPP_LINK || 'https://wa.me/5215512345678', '_blank')
  }

  const handleDemoClick = () => {
    trackEvent('demo_request', { source: 'home_hero' })
    window.open(process.env.NEXT_PUBLIC_BOOKING_URL || 'https://calendly.com/prime-growth', '_blank')
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
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

        <section className="section-padding">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">El sistema que activa tu crecimiento</h2>
              <p className="text-lg text-stone-600">
                Tres componentes que trabajan juntos para escalar sin romper tu operación
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <Zap className="mb-2 h-8 w-8 text-gold-500" />
                  <CardTitle>{siteContent.features.signalMap.name}</CardTitle>
                  <CardDescription>{siteContent.features.signalMap.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-stone-600">{siteContent.features.signalMap.details}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="mb-2 h-8 w-8 text-gold-500" />
                  <CardTitle>{siteContent.features.dealDesk.name}</CardTitle>
                  <CardDescription>{siteContent.features.dealDesk.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-stone-600">{siteContent.features.dealDesk.details}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <TrendingUp className="mb-2 h-8 w-8 text-gold-500" />
                  <CardTitle>{siteContent.features.opsAutopilot.name}</CardTitle>
                  <CardDescription>{siteContent.features.opsAutopilot.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-stone-600">{siteContent.features.opsAutopilot.details}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="section-padding bg-stone-50">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Métricas que importan</h2>
              <p className="text-lg text-stone-600">
                Benchmarks de industria que alcanzamos consistentemente
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Object.values(siteContent.metrics).map((metric) => (
                <div key={metric.label} className="rounded-lg bg-white p-6 shadow-sm">
                  <div className="mb-2 text-3xl font-bold text-gold-500">{metric.benchmark}</div>
                  <div className="text-lg font-semibold">{metric.label}</div>
                  <div className="text-sm text-stone-600">{metric.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Empieza con IGNITION</h2>
              <p className="text-lg text-stone-600">
                14 días para validar tu potencial de crecimiento
              </p>
            </div>

            <Card className="mx-auto max-w-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{siteContent.offers.ignition.name}</CardTitle>
                <CardDescription className="text-lg">
                  {siteContent.offers.ignition.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="mb-4 text-center">
                    <span className="text-4xl font-bold">{siteContent.offers.ignition.price}</span>
                    <span className="text-stone-600"> / {siteContent.offers.ignition.duration}</span>
                  </div>
                </div>

                <ul className="mb-8 space-y-3">
                  {siteContent.offers.ignition.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckCircle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span className="text-stone-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="rounded-lg bg-gold-50 p-4 text-center">
                  <p className="font-semibold text-gold-800">
                    {siteContent.offers.ignition.guarantee}
                  </p>
                </div>

                <div className="mt-8 text-center">
                  <Link href="/offers">
                    <Button size="lg" variant="gold" className="w-full sm:w-auto">
                      Ver todas las ofertas
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="section-padding bg-stone-900 text-white">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-6 text-3xl font-bold">
                Listo para activar tu crecimiento?
              </h2>
              <p className="mb-8 text-lg text-stone-300">
                Agenda una llamada de 20 minutos y te mostramos exactamente cómo funcionaría para tu negocio
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" variant="gold" onClick={handleDemoClick}>
                  Agendar demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-black hover:bg-white hover:text-stone-900" onClick={handleWhatsAppClick}>
                  WhatsApp directo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}