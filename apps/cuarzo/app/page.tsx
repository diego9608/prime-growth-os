'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Users,
  Target,
  Calendar,
  DollarSign,
  BarChart3,
  Building,
  Sparkles,
  FileText,
  Clock
} from 'lucide-react'
import { Button } from '@ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/components/card'
import { MetricCard, PresentationControls } from '@pitchkit/index'
import { useGAEvent } from '@analytics/provider'

export default function CuarzoPitch() {
  const trackEvent = useGAEvent()
  const [currentSection, setCurrentSection] = useState(0)

  useEffect(() => {
    trackEvent('open_presentation', { client: 'cuarzo' })
  }, [trackEvent])

  const handleExportPDF = () => {
    trackEvent('export_pdf', { client: 'cuarzo' })
  }

  const metrics = {
    current: {
      leadsMonth: '2-3',
      source: '100% referidos',
      closeRate: '60%',
      avgTicket: '$2.5M MXN',
      cycleTime: '90 días',
    },
    projected: {
      leadsMonth: '25-30',
      source: '70% digital, 30% referidos',
      closeRate: '35%',
      avgTicket: '$2.8M MXN',
      cycleTime: '60 días',
    },
  }

  const funnelStages = [
    { name: 'Impresiones', value: 50000, color: 'bg-stone-200' },
    { name: 'Clicks', value: 2500, color: 'bg-stone-300' },
    { name: 'Leads', value: 150, color: 'bg-stone-400' },
    { name: 'Citas agendadas', value: 45, color: 'bg-gold-400' },
    { name: 'Propuestas enviadas', value: 27, color: 'bg-gold-500' },
    { name: 'Contratos firmados', value: 9, color: 'bg-gold-600' },
  ]

  const investmentModels = [
    {
      name: 'Modelo A: Seguridad',
      retainer: '$180,000 MXN/mes',
      ads: '$50,000 MXN/mes',
      total: '$230,000 MXN/mes',
      guarantee: 'Garantía de 25 leads calificados',
      risk: 'Bajo',
      recommended: false,
    },
    {
      name: 'Modelo B: Equilibrio',
      retainer: '$120,000 MXN/mes',
      ads: '$80,000 MXN/mes',
      total: '$200,000 MXN/mes',
      guarantee: 'Base + performance (CAC objetivo)',
      risk: 'Medio',
      recommended: true,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <PresentationControls onExport={handleExportPDF} />

      <section className="pitch-section relative overflow-hidden bg-gradient-to-br from-stone-900 to-stone-800">
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center text-white">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-gold-500/20 px-6 py-2 text-gold-400">
              <Building className="h-5 w-5" />
              <span className="text-sm font-semibold">Para Cuarzo</span>
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight lg:text-7xl">
              Estudio lleno sin perder
              <span className="block text-gradient">la firma de Cuarzo</span>
            </h1>

            <p className="mb-8 text-xl text-stone-300">
              De 2-3 referidos al mes a 25 citas calificadas con decisores reales
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="rounded-lg bg-white/10 px-6 py-3">
                <p className="text-sm text-stone-400">Ticket promedio</p>
                <p className="text-2xl font-bold">$2.8M MXN</p>
              </div>
              <div className="rounded-lg bg-white/10 px-6 py-3">
                <p className="text-sm text-stone-400">ROI esperado</p>
                <p className="text-2xl font-bold">8.5x</p>
              </div>
              <div className="rounded-lg bg-white/10 px-6 py-3">
                <p className="text-sm text-stone-400">Tiempo a resultados</p>
                <p className="text-2xl font-bold">14 días</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pitch-section bg-stone-50">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              La historia que conocemos muy bien
            </h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gold-500" />
                    El problema del arquitecto exitoso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-stone-600">
                    Un despacho de arquitectura en Polanco. 15 años de trayectoria. Portfolio impecable.
                    Pero... temporadas de 3 meses sin proyectos nuevos. El fundador haciendo BD cuando
                    debería estar diseñando. Dependencia total de que "alguien te recomiende".
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-gold-500" />
                    Lo que intentó (y no funcionó)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-stone-600">
                    <li>• Instagram con renders espectaculares... 2,000 likes, 0 leads</li>
                    <li>• Google Ads manejado por el sobrino... $30K quemados, 5 spam</li>
                    <li>• Networking events... tarjetas que nunca se convierten</li>
                    <li>• "Página web nueva"... linda pero nadie la encuentra</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-gold-500 bg-gold-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-gold-600" />
                    El cambio (con nosotros)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 font-semibold text-stone-800">En 90 días:</p>
                  <ul className="space-y-2 text-stone-700">
                    <li>✓ Pipeline predecible: sabe qué proyectos vienen en 3-6 meses</li>
                    <li>✓ 25 citas al mes con decision makers (no curiosos)</li>
                    <li>✓ Sistema que trabaja 24/7 mientras diseña</li>
                    <li>✓ Equipo completo: no contrató a nadie nuevo</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="pitch-section">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Tus métricas: Hoy vs Mañana
          </h2>

          <div className="mx-auto max-w-5xl">
            <div className="mb-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border-2 border-stone-300 bg-white p-6">
                <h3 className="mb-4 text-xl font-semibold text-stone-600">Hoy (sin sistema)</h3>
                <div className="space-y-3">
                  {Object.entries(metrics.current).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-stone-500">{key}:</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border-2 border-gold-500 bg-gold-50 p-6">
                <h3 className="mb-4 text-xl font-semibold text-gold-700">En 90 días (con Prime Growth OS)</h3>
                <div className="space-y-3">
                  {Object.entries(metrics.projected).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-stone-600">{key}:</span>
                      <span className="font-bold text-stone-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="CPL (Costo por Lead)"
                value="850"
                format="currency"
                change={-15}
                changeLabel="vs promedio industria"
              />
              <MetricCard
                title="Show Rate"
                value="30"
                format="percentage"
                change={12}
                changeLabel="vs tu actual"
              />
              <MetricCard
                title="Propuesta a Cierre"
                value="35"
                format="percentage"
                description="1 de cada 3 propuestas"
              />
              <MetricCard
                title="ROI Proyectado"
                value="8.5x"
                format="number"
                description="En 6 meses"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pitch-section bg-stone-50">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Tu embudo de ventas optimizado
          </h2>

          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              {funnelStages.map((stage, index) => {
                const widthPercentage = 100 - (index * 15)
                return (
                  <div
                    key={stage.name}
                    className={`mx-auto mb-2 rounded-lg p-4 text-center text-white transition-all hover:scale-105 ${stage.color}`}
                    style={{ width: `${widthPercentage}%` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{stage.name}</span>
                      <span className="text-lg font-bold">{stage.value.toLocaleString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Landing específica</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-stone-600">
                    No tu portfolio. Una página que habla de sus miedos: sobrecostos,
                    retrasos, mala comunicación. Y cómo Cuarzo es diferente.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Brief de 5 minutos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-stone-600">
                    Formulario inteligente que califica: presupuesto, timeline,
                    ubicación. SDR hace follow-up en 5 minutos.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Propuesta en 2 capas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-stone-600">
                    Capa 1: concepto y precio. Si hay interés, Capa 2:
                    el desglose completo. Firma digital incluida.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="pitch-section">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Capacidad de escala controlada
          </h2>

          <div className="mx-auto max-w-4xl">
            <div className="mb-8 rounded-lg bg-gradient-to-r from-stone-100 to-stone-50 p-8">
              <h3 className="mb-4 text-xl font-semibold">Regla de oro de ocupación</h3>
              <p className="mb-4 text-stone-700">
                Cuando tu célula actual (tú + tu equipo) está al 80% de capacidad,
                activamos la segunda célula. Nunca antes, nunca después.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-white p-4">
                  <p className="mb-2 font-semibold">Célula 1 (Meses 1-3)</p>
                  <ul className="space-y-1 text-sm text-stone-600">
                    <li>• 25-30 leads/mes</li>
                    <li>• 8-10 citas</li>
                    <li>• 3-4 contratos</li>
                    <li>• Tu equipo actual</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-gold-50 p-4">
                  <p className="mb-2 font-semibold">Célula 2 (Mes 4+)</p>
                  <ul className="space-y-1 text-sm text-stone-600">
                    <li>• +20 leads/mes</li>
                    <li>• +6-8 citas</li>
                    <li>• +2-3 contratos</li>
                    <li>• Arquitecto jr + admin</li>
                  </ul>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Proyección de crecimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between">
                      <span>Q1 2024</span>
                      <span className="font-semibold">9 proyectos</span>
                    </div>
                    <div className="h-4 rounded-full bg-stone-200">
                      <div className="h-4 w-1/4 rounded-full bg-gold-500" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between">
                      <span>Q2 2024</span>
                      <span className="font-semibold">15 proyectos</span>
                    </div>
                    <div className="h-4 rounded-full bg-stone-200">
                      <div className="h-4 w-2/4 rounded-full bg-gold-500" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between">
                      <span>Q3 2024</span>
                      <span className="font-semibold">22 proyectos</span>
                    </div>
                    <div className="h-4 rounded-full bg-stone-200">
                      <div className="h-4 w-3/4 rounded-full bg-gold-500" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between">
                      <span>Q4 2024</span>
                      <span className="font-semibold">28 proyectos</span>
                    </div>
                    <div className="h-4 rounded-full bg-stone-200">
                      <div className="h-4 w-full rounded-full bg-gold-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="pitch-section bg-stone-50">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Tu inversión: 2 modelos
          </h2>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:grid-cols-2">
              {investmentModels.map((model) => (
                <Card key={model.name} className={model.recommended ? 'border-2 border-gold-500' : ''}>
                  {model.recommended && (
                    <div className="bg-gold-500 px-4 py-2 text-center text-sm font-bold text-white">
                      RECOMENDADO
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{model.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-stone-600">Retainer:</span>
                        <span className="font-semibold">{model.retainer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-600">Inversión Ads:</span>
                        <span className="font-semibold">{model.ads}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between">
                          <span className="font-semibold">Total mensual:</span>
                          <span className="text-xl font-bold text-gold-600">{model.total}</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-stone-50 p-3">
                      <p className="text-sm font-semibold text-stone-700">{model.guarantee}</p>
                      <p className="text-xs text-stone-500">Nivel de riesgo: {model.risk}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 rounded-lg bg-gradient-to-r from-gold-100 to-gold-50 p-6">
              <h3 className="mb-3 font-semibold">Qué incluye cualquier modelo:</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  <span className="text-sm">Landing page de conversión</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  <span className="text-sm">Campañas Google + Meta</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  <span className="text-sm">SDR dedicado (llamadas)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  <span className="text-sm">Dashboard en tiempo real</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  <span className="text-sm">WhatsApp Business automatizado</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  <span className="text-sm">Reportes semanales</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pitch-section">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Las objeciones (resueltas)
          </h2>

          <div className="mx-auto max-w-3xl space-y-4">
            {[
              {
                objection: 'La arquitectura es muy personal, no se vende online',
                answer: 'Por eso no vendemos online. Generamos la cita para que vendas tú.',
              },
              {
                objection: 'Ya probé agencias y no funcionó',
                answer: 'No somos agencia. Somos tu departamento de growth con KPIs compartidos.',
              },
              {
                objection: 'Mi ticket es muy alto para decisiones rápidas',
                answer: 'Perfecto. Nuestro nurturing está diseñado para ciclos de 60-90 días.',
              },
              {
                objection: 'No tengo tiempo para más juntas/reportes',
                answer: 'Dashboard 24/7 + 1 llamada semanal de 15 min. Eso es todo.',
              },
              {
                objection: 'Qué pasa si quiero cancelar?',
                answer: '30 días de notice. Sin penalizaciones. Sin letra chica.',
              },
            ].map((item, index) => (
              <Card key={index}>
                <CardContent className="flex gap-4 p-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
                      ?
                    </div>
                  </div>
                  <div className="flex-grow">
                    <p className="mb-2 font-semibold text-stone-800">"{item.objection}"</p>
                    <p className="text-stone-600">{item.answer}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pitch-section relative overflow-hidden bg-gradient-to-br from-stone-900 to-stone-800">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center text-white">
            <h2 className="mb-6 text-4xl font-bold">
              Firmamos hoy, arrancamos mañana
            </h2>

            <p className="mb-8 text-xl text-stone-300">
              En 14 días tendrás los primeros leads tocan la puerta de Cuarzo
            </p>

            <div className="mb-8 inline-flex flex-col items-center gap-4 rounded-lg bg-white/10 p-8 backdrop-blur">
              <FileText className="h-16 w-16 text-gold-400" />
              <p className="text-lg font-semibold">Contrato digital listo</p>
              <p className="text-stone-300">Escanea el QR o click al botón</p>

              <div className="flex gap-4">
                <Button size="lg" variant="gold" className="text-stone-900">
                  Firmar Modelo A
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" className="bg-white text-stone-900 hover:bg-stone-100">
                  Firmar Modelo B
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4 text-left sm:grid-cols-3">
              <div className="rounded-lg bg-white/10 p-4">
                <p className="mb-1 text-sm text-stone-400">Próximo paso</p>
                <p className="font-semibold">Kick-off call mañana</p>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <p className="mb-1 text-sm text-stone-400">Día 7</p>
                <p className="font-semibold">Landing live + campañas</p>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <p className="mb-1 text-sm text-stone-400">Día 14</p>
                <p className="font-semibold">Primeros leads calificados</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}