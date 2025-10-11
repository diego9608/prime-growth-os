'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type SimulationData = {
  id: string
  type: 'baseline' | 'tobe'
  data: any
  createdAt: string
}

type KPI = {
  name: string
  baseline: number
  tobe: number
  unit: string
  format: 'number' | 'currency' | 'percentage'
  delta: number
  deltaPercent: number
}

export default function ComparePage() {
  const params = useParams()
  const [simulation, setSimulation] = useState<SimulationData | null>(null)
  const [kpis, setKpis] = useState<KPI[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(params.id as string)
    if (stored) {
      const sim = JSON.parse(stored)
      setSimulation(sim)
      calculateKPIs(sim.data)
    }
  }, [params.id])

  const calculateKPIs = (data: any) => {
    const totalLeads = Object.values(data.step1.leadsPerChannel).reduce((a: any, b: any) => a + b, 0) as number
    const totalAppointments = totalLeads * (data.step1.showRate / 100)
    const totalProposals = totalAppointments * (data.step2.winRate / 100)
    const avgTicket = (data.step2.ticketByPackage.basic + data.step2.ticketByPackage.standard + data.step2.ticketByPackage.premium) / 3
    const revenue = totalProposals * avgTicket
    const marginAmount = revenue * (data.step4.margin / 100)

    const baselineKPIs: KPI[] = [
      {
        name: 'Ingresos Mensuales',
        baseline: revenue,
        tobe: revenue * 1.35,
        unit: 'MXN',
        format: 'currency',
        delta: revenue * 0.35,
        deltaPercent: 35
      },
      {
        name: 'Margen Neto',
        baseline: data.step4.margin,
        tobe: data.step4.margin + 8,
        unit: '%',
        format: 'percentage',
        delta: 8,
        deltaPercent: (8 / data.step4.margin) * 100
      },
      {
        name: 'DSO',
        baseline: data.step4.dso,
        tobe: Math.max(data.step4.dso - 15, 30),
        unit: 'días',
        format: 'number',
        delta: -15,
        deltaPercent: (-15 / data.step4.dso) * 100
      },
      {
        name: 'Capacidad Activa',
        baseline: data.step3.activeCapacity,
        tobe: data.step5.maxCapacity,
        unit: 'proyectos',
        format: 'number',
        delta: data.step5.maxCapacity - data.step3.activeCapacity,
        deltaPercent: ((data.step5.maxCapacity - data.step3.activeCapacity) / data.step3.activeCapacity) * 100
      },
      {
        name: 'Win Rate',
        baseline: data.step2.winRate,
        tobe: Math.min(data.step2.winRate + 12, 100),
        unit: '%',
        format: 'percentage',
        delta: 12,
        deltaPercent: (12 / data.step2.winRate) * 100
      },
      {
        name: 'OTIF',
        baseline: data.step3.otif,
        tobe: Math.min(data.step3.otif + 15, 100),
        unit: '%',
        format: 'percentage',
        delta: 15,
        deltaPercent: (15 / data.step3.otif) * 100
      },
      {
        name: 'Speed-to-Lead',
        baseline: data.step1.speedToLead,
        tobe: Math.max(data.step1.speedToLead - 30, 5),
        unit: 'min',
        format: 'number',
        delta: -30,
        deltaPercent: (-30 / data.step1.speedToLead) * 100
      }
    ]

    setKpis(baselineKPIs)
  }

  const formatValue = (value: number, format: string, unit: string) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString('es-MX', { maximumFractionDigits: 0 })} ${unit}`
      case 'percentage':
        return `${value.toFixed(1)}${unit}`
      case 'number':
        return `${Math.round(value)} ${unit}`
      default:
        return `${value} ${unit}`
    }
  }

  const exportPDF = () => {
    window.print()
  }

  if (!simulation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando simulación...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8 flex justify-between items-center print:hidden">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cuarzo: As-Is vs To-Be</h1>
            <p className="mt-2 text-gray-600">Comparación de escenarios</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={exportPDF}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Exportar PDF
            </button>
            <Link
              href="/simulate/new"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Nueva Simulación
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cuarzo Hoy (As-Is)</h2>
            <div className="space-y-4">
              {kpis.map((kpi) => (
                <div key={kpi.name} className="flex justify-between items-center">
                  <span className="text-gray-600">{kpi.name}</span>
                  <span className="font-semibold text-gray-900">
                    {formatValue(kpi.baseline, kpi.format, kpi.unit)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cuarzo Meta (To-Be)</h2>
            <div className="space-y-4">
              {kpis.map((kpi) => (
                <div key={kpi.name} className="flex justify-between items-center">
                  <span className="text-gray-600">{kpi.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">
                      {formatValue(kpi.tobe, kpi.format, kpi.unit)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        kpi.delta > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {kpi.delta > 0 ? '+' : ''}{kpi.deltaPercent.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Deltas y Mejoras</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kpis.map((kpi) => (
              <div key={kpi.name} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">{kpi.name}</div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${kpi.delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.delta > 0 ? '+' : ''}{kpi.deltaPercent.toFixed(0)}%
                  </span>
                  <span className="text-sm text-gray-500">
                    ({kpi.delta > 0 ? '+' : ''}{formatValue(Math.abs(kpi.delta), kpi.format, kpi.unit)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Alertas de Capacidad</h2>
          <div className="space-y-2">
            {simulation.data.step5.maxCapacity > simulation.data.step3.activeCapacity && (
              <div className="flex items-start gap-2">
                <span className="text-blue-600">⚠️</span>
                <p className="text-sm text-blue-800">
                  Se requiere aumentar capacidad de {simulation.data.step3.activeCapacity} a {simulation.data.step5.maxCapacity} proyectos
                  para mantener el compromiso de propuestas en 72h
                </p>
              </div>
            )}
            {simulation.data.step2.proposalsUnder72h < 90 && (
              <div className="flex items-start gap-2">
                <span className="text-blue-600">💡</span>
                <p className="text-sm text-blue-800">
                  Actualmente solo {simulation.data.step2.proposalsUnder72h}% de propuestas se entregan en ≤72h.
                  Meta: 90%+
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 print:block">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">SpendPlan Recomendado</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Meta Ads</div>
              <div className="text-lg font-semibold text-gray-900">
                ${simulation.data.step5.budgetByChannel.meta.toLocaleString('es-MX')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {simulation.data.step1.leadsPerChannel.meta} leads
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Google Ads</div>
              <div className="text-lg font-semibold text-gray-900">
                ${simulation.data.step5.budgetByChannel.google.toLocaleString('es-MX')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {simulation.data.step1.leadsPerChannel.google} leads
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Referral</div>
              <div className="text-lg font-semibold text-gray-900">
                ${simulation.data.step5.budgetByChannel.referral.toLocaleString('es-MX')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {simulation.data.step1.leadsPerChannel.referral} leads
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Orgánico</div>
              <div className="text-lg font-semibold text-gray-900">
                ${simulation.data.step5.budgetByChannel.organic.toLocaleString('es-MX')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {simulation.data.step1.leadsPerChannel.organic} leads
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Budget Total Mensual</span>
              <span className="text-xl font-bold text-gray-900">
                ${Object.values(simulation.data.step5.budgetByChannel).reduce((a: any, b: any) => a + b, 0).toLocaleString('es-MX')} MXN
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  )
}