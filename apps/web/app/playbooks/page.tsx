'use client'

import { useEffect } from 'react'
import { Building2, ShoppingCart, Factory, Briefcase, ArrowRight } from 'lucide-react'
import { Button } from '@ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/components/card'
import { siteContent } from '@content/copy'
import { useGAEvent } from '@analytics/provider'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function PlaybooksPage() {
  const trackEvent = useGAEvent()

  useEffect(() => {
    trackEvent('view_playbooks')
  }, [trackEvent])

  const playbooks = [
    {
      ...siteContent.playbooks.architecture,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      ...siteContent.playbooks.ecommerce,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      ...siteContent.playbooks.manufacturing,
      icon: Factory,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      ...siteContent.playbooks.professional,
      icon: Briefcase,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  const handlePlaybookInterest = (playbookName: string) => {
    trackEvent('playbook_interest', { playbook: playbookName })
    window.open(process.env.NEXT_PUBLIC_WHATSAPP_LINK || 'https://wa.me/5215512345678', '_blank')
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <section className="section-padding bg-gradient-to-b from-stone-50 to-white">
          <div className="container">
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-4xl font-bold">Playbooks por industria</h1>
              <p className="text-lg text-stone-600">
                Estrategias probadas, adaptadas a tu vertical
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {playbooks.map((playbook) => {
                const Icon = playbook.icon
                return (
                  <Card key={playbook.name} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{playbook.name}</CardTitle>
                          <CardDescription className="mt-2 text-base">
                            {playbook.hook}
                          </CardDescription>
                        </div>
                        <div className={`rounded-lg p-3 ${playbook.bgColor}`}>
                          <Icon className={`h-6 w-6 ${playbook.color}`} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6 grid grid-cols-3 gap-4">
                        {Object.entries(playbook.metrics).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <p className="text-lg font-bold text-stone-900">{value}</p>
                            <p className="text-xs text-stone-600">{key}</p>
                          </div>
                        ))}
                      </div>

                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => handlePlaybookInterest(playbook.name)}
                      >
                        Explorar este playbook
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="mt-16 rounded-lg bg-stone-900 p-8 text-center text-white">
              <h2 className="mb-4 text-2xl font-bold">Tu industria no está aquí?</h2>
              <p className="mb-6 text-stone-300">
                Hemos trabajado con +20 verticales diferentes. Contáctanos para explorar cómo adaptar Prime Growth OS a tu negocio.
              </p>
              <Button
                size="lg"
                variant="gold"
                onClick={() => handlePlaybookInterest('Custom')}
              >
                Hablar de mi caso específico
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}