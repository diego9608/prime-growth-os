'use client'

import { useEffect } from 'react'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/components/card'
import { siteContent } from '@content/copy'
import { useGAEvent } from '@analytics/provider'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function OffersPage() {
  const trackEvent = useGAEvent()

  useEffect(() => {
    trackEvent('view_offers')
  }, [trackEvent])

  const offers = [
    siteContent.offers.ignition,
    siteContent.offers.prime,
    siteContent.offers.primePlus,
    siteContent.offers.atlas,
  ]

  const handleContactClick = (offerName: string) => {
    trackEvent('offer_interest', { offer: offerName })
    window.open(process.env.NEXT_PUBLIC_WHATSAPP_LINK || 'https://wa.me/5215512345678', '_blank')
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <section className="section-padding bg-gradient-to-b from-stone-50 to-white">
          <div className="container">
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-4xl font-bold">Elige tu velocidad de crecimiento</h1>
              <p className="text-lg text-stone-600">
                Desde pruebas de concepto hasta escala enterprise
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {offers.map((offer) => (
                <Card key={offer.name} className="relative overflow-hidden">
                  {offer.name === 'PRIME+' && (
                    <div className="absolute right-0 top-0 bg-gold-500 px-3 py-1 text-xs font-bold text-stone-900">
                      MÁS POPULAR
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{offer.name}</CardTitle>
                    <CardDescription className="text-lg">{offer.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="mb-4">
                        <span className="text-3xl font-bold">{offer.price}</span>
                        {offer.duration !== 'Enterprise' && (
                          <span className="text-stone-600"> / {offer.duration}</span>
                        )}
                      </div>
                    </div>

                    <ul className="mb-6 space-y-3">
                      {offer.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <CheckCircle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                          <span className="text-stone-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mb-6 rounded-lg bg-stone-50 p-4">
                      <p className="text-sm font-semibold text-stone-700">{offer.guarantee}</p>
                    </div>

                    <Button
                      className="w-full"
                      variant={offer.name === 'PRIME+' ? 'gold' : 'default'}
                      onClick={() => handleContactClick(offer.name)}
                    >
                      Solicitar información
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}