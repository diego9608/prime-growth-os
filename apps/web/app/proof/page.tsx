'use client'

import { useEffect } from 'react'
import { Star, TrendingUp, Users, Target } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/components/card'
import { useGAEvent } from '@analytics/provider'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function ProofPage() {
  const trackEvent = useGAEvent()

  useEffect(() => {
    trackEvent('view_proof')
  }, [trackEvent])

  const cases = [
    {
      industry: 'Arquitectura Residencial',
      company: 'Estudio de diseño boutique',
      challenge: 'Dependían 100% de referidos, temporadas muertas de 3 meses',
      solution: 'Landing específica + Google Ads + nurturing por WhatsApp',
      results: {
        cpl: '$85 USD',
        showRate: '35%',
        closeRate: '24%',
        avgTicket: '$125,000 USD',
        roi: '8.2x en 6 meses',
      },
    },
    {
      industry: 'E-commerce Moda',
      company: 'Marca D2C de accesorios',
      challenge: 'CAC alto en Meta, ROAS inconsistente',
      solution: 'Funnel completo + email automation + retargeting segmentado',
      results: {
        cpl: '$12 USD',
        conversionRate: '3.8%',
        ltv: '$450 USD',
        repeatRate: '38%',
        roi: '12x en 90 días',
      },
    },
    {
      industry: 'Consultoría B2B',
      company: 'Firma de transformación digital',
      challenge: 'Ciclos de venta largos, pipeline vacío',
      solution: 'LinkedIn Ads + webinars + SDR team + propuestas automatizadas',
      results: {
        cpl: '$220 USD',
        qualifiedRate: '42%',
        dealSize: '$85,000 USD',
        cycleTime: '45 días (de 120)',
        roi: '5.5x anual',
      },
    },
  ]

  const testimonials = [
    {
      quote: 'En 3 meses pasamos de 2-3 leads por mes a 25 citas calificadas. El sistema es impecable.',
      author: 'Director Comercial',
      company: 'Despacho de Arquitectura',
      rating: 5,
    },
    {
      quote: 'El tablero en tiempo real cambió todo. Ahora tomo decisiones con data, no con intuición.',
      author: 'CEO',
      company: 'SaaS Mexicano',
      rating: 5,
    },
    {
      quote: 'Duplicamos ventas sin duplicar el equipo. El ROI es innegable.',
      author: 'VP Ventas',
      company: 'Manufactura Industrial',
      rating: 5,
    },
  ]

  const metrics = [
    { label: 'Clientes activos', value: '47', icon: Users },
    { label: 'Leads generados', value: '12,847', icon: Target },
    { label: 'ROI promedio', value: '7.3x', icon: TrendingUp },
    { label: 'NPS', value: '82', icon: Star },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <section className="section-padding bg-gradient-to-b from-stone-50 to-white">
          <div className="container">
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-4xl font-bold">Resultados reales, clientes reales</h1>
              <p className="text-lg text-stone-600">
                No vendemos promesas. Vendemos métricas verificables
              </p>
            </div>

            <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => {
                const Icon = metric.icon
                return (
                  <Card key={metric.label}>
                    <CardContent className="flex items-center justify-between p-6">
                      <div>
                        <p className="text-3xl font-bold">{metric.value}</p>
                        <p className="text-sm text-stone-600">{metric.label}</p>
                      </div>
                      <Icon className="h-8 w-8 text-gold-500" />
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="mb-16">
              <h2 className="mb-8 text-center text-2xl font-bold">Casos de estudio</h2>
              <div className="grid gap-8 lg:grid-cols-3">
                {cases.map((case_, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{case_.industry}</CardTitle>
                      <CardDescription>{case_.company}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="mb-2 text-sm font-semibold text-stone-700">Reto:</p>
                        <p className="text-sm text-stone-600">{case_.challenge}</p>
                      </div>
                      <div className="mb-4">
                        <p className="mb-2 text-sm font-semibold text-stone-700">Solución:</p>
                        <p className="text-sm text-stone-600">{case_.solution}</p>
                      </div>
                      <div className="rounded-lg bg-gold-50 p-4">
                        <p className="mb-2 text-sm font-semibold text-stone-700">Resultados:</p>
                        <ul className="space-y-1 text-sm text-stone-600">
                          {Object.entries(case_.results).map(([key, value]) => (
                            <li key={key}>
                              <span className="font-medium">{key}:</span> {value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-8 text-center text-2xl font-bold">Lo que dicen nuestros clientes</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {testimonials.map((testimonial, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="mb-4 flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-gold-500 text-gold-500" />
                        ))}
                      </div>
                      <blockquote className="mb-4 text-stone-700">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="text-sm">
                        <p className="font-semibold">{testimonial.author}</p>
                        <p className="text-stone-600">{testimonial.company}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}