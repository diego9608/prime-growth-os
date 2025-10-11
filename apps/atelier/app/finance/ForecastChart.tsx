'use client'

import { useState } from 'react'
import { LineChart, TrendingUp, Download, Info } from 'lucide-react'

type Scenario = 'conservative' | 'base' | 'optimistic'

type DataPoint = {
  date: string
  actual?: number
  forecast?: number
  p5?: number
  p95?: number
}

const generateForecastData = (scenario: Scenario): DataPoint[] => {
  const today = new Date()
  const data: DataPoint[] = []

  // Historical data (últimos 6 meses)
  for (let i = 6; i > 0; i--) {
    const date = new Date(today)
    date.setMonth(date.getMonth() - i)
    data.push({
      date: date.toISOString().slice(0, 7),
      actual: 1500000 + Math.random() * 500000
    })
  }

  // Mes actual
  data.push({
    date: today.toISOString().slice(0, 7),
    actual: 1850000
  })

  // Forecast (próximos 3 meses)
  const growthRates = {
    conservative: 0.02,
    base: 0.05,
    optimistic: 0.08
  }

  const growth = growthRates[scenario]
  let baseValue = 1850000

  for (let i = 1; i <= 3; i++) {
    const date = new Date(today)
    date.setMonth(date.getMonth() + i)
    baseValue = baseValue * (1 + growth)

    data.push({
      date: date.toISOString().slice(0, 7),
      forecast: baseValue,
      p5: baseValue * 0.85,  // Percentil 5
      p95: baseValue * 1.15  // Percentil 95
    })
  }

  return data
}

export default function ForecastChart() {
  const [scenario, setScenario] = useState<Scenario>('base')
  const [showTooltip, setShowTooltip] = useState(false)
  const data = generateForecastData(scenario)

  const todayIndex = data.findIndex(d => d.actual && !d.forecast) || 6
  const maxValue = Math.max(...data.map(d => d.actual || d.p95 || 0))
  const minValue = Math.min(...data.filter(d => d.actual || d.p5).map(d => d.actual || d.p5 || Infinity))

  const getYPosition = (value: number) => {
    const range = maxValue - minValue
    const percentage = ((maxValue - value) / range) * 80 + 10
    return percentage
  }

  const scenarios = {
    conservative: { name: 'Conservador', color: 'warning', growth: '+2%/mes' },
    base: { name: 'Base', color: 'cyan', growth: '+5%/mes' },
    optimistic: { name: 'Optimista', color: 'success', growth: '+8%/mes' }
  }

  const exportPDF = () => {
    window.print()
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LineChart className="h-6 w-6 text-cyan-500" />
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Forecast de Ingresos</h2>
            <p className="text-sm text-text-secondary">Proyección a 90 días con bandas de confianza</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-dark-surface rounded-lg p-1">
            {(Object.keys(scenarios) as Scenario[]).map((key) => (
              <button
                key={key}
                onClick={() => setScenario(key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  scenario === key
                    ? `bg-${scenarios[key].color}-500/20 text-${scenarios[key].color}-500`
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {scenarios[key].name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className="p-2 rounded-lg bg-dark-surface text-text-secondary hover:text-text-primary"
          >
            <Info className="h-4 w-4" />
          </button>

          <button onClick={exportPDF} className="btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {showTooltip && (
        <div className="mb-4 p-4 bg-violet-500/10 border border-violet-500/20 rounded-lg">
          <h3 className="text-sm font-medium text-text-primary mb-2">Supuestos del Escenario {scenarios[scenario].name}</h3>
          <ul className="text-sm text-text-secondary space-y-1">
            <li>• Crecimiento mensual: {scenarios[scenario].growth}</li>
            <li>• Banda de confianza: P5 - P95 (90% de probabilidad)</li>
            <li>• Basado en tendencia histórica de 6 meses</li>
            <li>• Considera estacionalidad y pipeline actual</li>
          </ul>
        </div>
      )}

      <div className="relative h-80 bg-dark-surface/30 rounded-lg p-6">
        <svg className="w-full h-full" viewBox="0 0 800 300">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="40"
              y1={y * 2.4 + 30}
              x2="760"
              y2={y * 2.4 + 30}
              stroke="currentColor"
              strokeWidth="1"
              className="text-dark-border"
              strokeDasharray="4 4"
            />
          ))}

          {/* Y-axis labels */}
          {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0].map((val, i) => (
            <text
              key={i}
              x="30"
              y={30 + i * 60}
              className="text-xs fill-text-tertiary"
              textAnchor="end"
            >
              ${(val / 1000000).toFixed(1)}M
            </text>
          ))}

          {/* Banda P5-P95 (solo forecast) */}
          {data.slice(todayIndex).length > 1 && (
            <path
              d={`
                M ${40 + (todayIndex * (720 / data.length))} ${getYPosition(data[todayIndex].actual || 0) * 2.4 + 30}
                ${data.slice(todayIndex + 1).map((d, i) =>
                  `L ${40 + ((todayIndex + 1 + i) * (720 / data.length))} ${getYPosition(d.p95 || 0) * 2.4 + 30}`
                ).join(' ')}
                ${data.slice(todayIndex + 1).reverse().map((d, i) =>
                  `L ${40 + ((todayIndex + data.length - todayIndex - 1 - i) * (720 / data.length))} ${getYPosition(d.p5 || 0) * 2.4 + 30}`
                ).join(' ')}
                Z
              `}
              fill="currentColor"
              className={`text-${scenarios[scenario].color}-500`}
              opacity="0.15"
            />
          )}

          {/* Línea actual (histórico) */}
          <path
            d={`M ${data.slice(0, todayIndex + 1).map((d, i) =>
              `${i === 0 ? 'M' : 'L'} ${40 + (i * (720 / data.length))} ${getYPosition(d.actual || 0) * 2.4 + 30}`
            ).join(' ')}`}
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-gold-500"
          />

          {/* Línea punteada (forecast) */}
          <path
            d={`M ${40 + (todayIndex * (720 / data.length))} ${getYPosition(data[todayIndex].actual || 0) * 2.4 + 30}
              ${data.slice(todayIndex + 1).map((d, i) =>
                `L ${40 + ((todayIndex + 1 + i) * (720 / data.length))} ${getYPosition(d.forecast || 0) * 2.4 + 30}`
              ).join(' ')}`}
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray="8 8"
            className={`text-${scenarios[scenario].color}-500`}
          />

          {/* Línea vertical "HOY" */}
          <line
            x1={40 + (todayIndex * (720 / data.length))}
            y1="30"
            x2={40 + (todayIndex * (720 / data.length))}
            y2="270"
            stroke="currentColor"
            strokeWidth="2"
            className="text-text-tertiary"
            strokeDasharray="4 4"
          />

          <text
            x={40 + (todayIndex * (720 / data.length))}
            y="20"
            className="text-xs fill-text-primary font-medium"
            textAnchor="middle"
          >
            HOY
          </text>

          {/* X-axis labels */}
          {data.map((d, i) => (
            i % 2 === 0 && (
              <text
                key={i}
                x={40 + (i * (720 / data.length))}
                y="290"
                className="text-xs fill-text-tertiary"
                textAnchor="middle"
              >
                {d.date.slice(5)}
              </text>
            )
          ))}

          {/* Puntos en la línea */}
          {data.map((d, i) => (
            <circle
              key={i}
              cx={40 + (i * (720 / data.length))}
              cy={getYPosition(d.actual || d.forecast || 0) * 2.4 + 30}
              r="4"
              fill="currentColor"
              className={i <= todayIndex ? 'text-gold-500' : `text-${scenarios[scenario].color}-500`}
            />
          ))}
        </svg>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-gold-500"></div>
            <span className="text-sm text-text-secondary">Real</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-0.5 bg-${scenarios[scenario].color}-500`} style={{ backgroundImage: 'repeating-linear-gradient(to right, currentColor 0, currentColor 4px, transparent 4px, transparent 8px)' }}></div>
            <span className="text-sm text-text-secondary">Proyección</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-3 bg-${scenarios[scenario].color}-500 opacity-15`}></div>
            <span className="text-sm text-text-secondary">Banda P5-P95</span>
          </div>
        </div>

        <div className="text-sm text-text-secondary">
          Próxima actualización: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-MX')}
        </div>
      </div>
    </div>
  )
}