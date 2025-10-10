import { KPI, OptimizationResult } from '@prime-growth-os/types'
import { optimizeSpend } from '@prime-growth-os/engine'
import KPICard from './components/KPICard'
import { BarChart3, Target, Zap, AlertCircle } from 'lucide-react'

// Mock data for KPIs
const kpis: KPI[] = [
  {
    id: 'speed-to-lead',
    name: 'Speed-to-Lead',
    value: 18,
    unit: 'min',
    target: 15,
    status: 'yellow',
    trend: 'down',
    description: 'Tiempo promedio de respuesta inicial',
    tooltip: 'Speed-to-Lead: Tiempo desde que llega un lead hasta el primer contacto. Objetivo: ≤15 minutos para maximizar conversión.'
  },
  {
    id: 'cpq-72h',
    name: 'CPQ ≤72h',
    value: 87,
    unit: '%',
    target: 95,
    status: 'yellow',
    trend: 'up',
    description: 'Cotizaciones entregadas en 72h',
    tooltip: 'CPQ ≤72h: Porcentaje de cotizaciones (Configure, Price, Quote) entregadas dentro de 72 horas. Meta: 95% para competitividad.'
  },
  {
    id: 'otif',
    name: 'OTIF',
    value: 92,
    unit: '%',
    target: 98,
    status: 'green',
    trend: 'stable',
    description: 'On Time In Full - Entregas completas',
    tooltip: 'OTIF: On Time In Full - Porcentaje de proyectos entregados a tiempo y completos según especificaciones. Estándar de excelencia: 98%.'
  },
  {
    id: 'dso',
    name: 'DSO',
    value: 35,
    unit: 'días',
    target: 30,
    status: 'yellow',
    trend: 'up',
    description: 'Days Sales Outstanding - Días de cobro',
    tooltip: 'DSO: Days Sales Outstanding - Promedio de días para cobrar facturas. Objetivo: ≤30 días para flujo de caja saludable.'
  },
  {
    id: 'margin',
    name: 'Margen',
    value: 28,
    unit: '%',
    target: 35,
    status: 'red',
    trend: 'down',
    description: 'Margen bruto promedio',
    tooltip: 'Margen Bruto: Porcentaje de ganancia después de costos directos. Meta: 35% para sostenibilidad financiera del estudio.'
  },
  {
    id: 'appointments',
    name: 'Citas/día',
    value: 3.2,
    unit: 'citas',
    target: 4,
    status: 'yellow',
    trend: 'stable',
    description: 'Promedio de citas comerciales diarias',
    tooltip: 'Citas/día: Promedio de reuniones comerciales por día laboral. Objetivo: 4 citas para mantener pipeline robusto.'
  },
  {
    id: 'win-rate',
    name: 'Win Rate',
    value: 42,
    unit: '%',
    target: 50,
    status: 'yellow',
    trend: 'up',
    description: 'Tasa de conversión de propuestas',
    tooltip: 'Win Rate: Porcentaje de propuestas que se convierten en proyectos ganados. Benchmark industria: 50% para estudios establecidos.'
  }
]

// Mock data for spend optimization
const optimizationData = optimizeSpend({
  channels: ['Google Ads', 'Facebook Ads', 'LinkedIn Ads', 'SEO Orgánico', 'Email Marketing', 'Referidos'],
  budgets: [15000, 12000, 8000, 5000, 3000, 7000],
  targets: {
    leads: 45,
    conversion: 0.15,
    cost_per_lead: 55
  },
  constraints: {
    min_budget_per_channel: 2000,
    max_budget_per_channel: 20000
  }
})

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Atelier</h1>
            <p className="text-gray-600 mt-2">
              Gestión integral para estudios de arquitectura - Vista consolidada de KPIs operacionales
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Última actualización</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date().toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Indicadores Clave de Rendimiento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </div>

      {/* Spend Optimization Panel */}
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Optimización de Inversión en Canales</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recommendations Chart */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Asignación Recomendada</h3>
            <div className="space-y-4">
              {optimizationData.map((channel, index) => (
                <div key={channel.channel} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{channel.channel}</span>
                      <span className="text-sm text-gray-600">
                        ${channel.recommended_budget.toLocaleString('es-MX')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{
                          width: `${(channel.recommended_budget / Math.max(...optimizationData.map(c => c.recommended_budget))) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{channel.expected_leads} leads esperados</span>
                      <span>Eficiencia: {channel.efficiency_score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas Proyectadas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium text-primary-900">Total Leads</span>
                </div>
                <p className="text-2xl font-bold text-primary-900 mt-2">
                  {optimizationData.reduce((sum, channel) => sum + channel.expected_leads, 0)}
                </p>
                <p className="text-xs text-primary-700">
                  +{Math.round(((optimizationData.reduce((sum, channel) => sum + channel.expected_leads, 0) / 38) - 1) * 100)}% vs mes anterior
                </p>
              </div>

              <div className="bg-success-50 p-4 rounded-lg border border-success-200">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-success-600" />
                  <span className="text-sm font-medium text-success-900">CPL Promedio</span>
                </div>
                <p className="text-2xl font-bold text-success-900 mt-2">
                  ${Math.round(optimizationData.reduce((sum, channel) => sum + (channel.recommended_budget / channel.expected_leads), 0) / optimizationData.length).toLocaleString('es-MX')}
                </p>
                <p className="text-xs text-success-700">
                  -8% vs objetivo actual
                </p>
              </div>

              <div className="bg-warning-50 p-4 rounded-lg border border-warning-200">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-warning-600" />
                  <span className="text-sm font-medium text-warning-900">Confianza</span>
                </div>
                <p className="text-2xl font-bold text-warning-900 mt-2">
                  {Math.round(optimizationData.reduce((sum, channel) => sum + channel.confidence, 0) / optimizationData.length * 100)}%
                </p>
                <p className="text-xs text-warning-700">
                  Basado en datos históricos
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">Inversión Total</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ${optimizationData.reduce((sum, channel) => sum + channel.recommended_budget, 0).toLocaleString('es-MX')}
                </p>
                <p className="text-xs text-gray-700">
                  Presupuesto mensual recomendado
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Recomendaciones Clave</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Incrementar inversión en LinkedIn Ads (+40% efficiency)</li>
                <li>• Optimizar SEO orgánico para mejor cost per lead</li>
                <li>• Reforzar programa de referidos con incentivos</li>
                <li>• Implementar retargeting en Facebook Ads</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="btn-primary justify-start text-left p-4 h-auto">
            <div>
              <p className="font-medium">Nuevo Lead</p>
              <p className="text-sm opacity-90">Registrar prospecto</p>
            </div>
          </button>
          <button className="btn-secondary justify-start text-left p-4 h-auto">
            <div>
              <p className="font-medium">Generar CPQ</p>
              <p className="text-sm opacity-70">Crear cotización</p>
            </div>
          </button>
          <button className="btn-outline justify-start text-left p-4 h-auto">
            <div>
              <p className="font-medium">Revisar Pipeline</p>
              <p className="text-sm opacity-70">Ver proyectos activos</p>
            </div>
          </button>
          <button className="btn-outline justify-start text-left p-4 h-auto">
            <div>
              <p className="font-medium">Reporte Financiero</p>
              <p className="text-sm opacity-70">Análisis mensual</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}