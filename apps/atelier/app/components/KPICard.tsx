'use client'

import { KPI } from '@prime-growth-os/types'
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import { useState } from 'react'

interface KPICardProps {
  kpi: KPI
}

export default function KPICard({ kpi }: KPICardProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const getStatusColor = (status: KPI['status']) => {
    switch (status) {
      case 'green':
        return 'status-green'
      case 'yellow':
        return 'status-yellow'
      case 'red':
        return 'status-red'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTrendIcon = (trend: KPI['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-danger-600" />
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getProgressPercentage = () => {
    return Math.min(100, (kpi.value / kpi.target) * 100)
  }

  return (
    <div className="kpi-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900">{kpi.name}</h3>
          {kpi.tooltip && (
            <div className="relative">
              <Info
                className="h-4 w-4 text-gray-400 cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              />
              {showTooltip && (
                <div className="absolute z-10 w-64 p-2 text-xs bg-gray-900 text-white rounded-lg shadow-lg -top-2 left-6">
                  {kpi.tooltip}
                  <div className="absolute top-2 -left-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {getTrendIcon(kpi.trend)}
          <span className={`badge ${getStatusColor(kpi.status)}`}>
            {kpi.status === 'green' ? 'Óptimo' : kpi.status === 'yellow' ? 'Atención' : 'Crítico'}
          </span>
        </div>
      </div>

      {/* Value */}
      <div className="mb-4">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900">
            {kpi.value.toLocaleString('es-MX')}
          </span>
          <span className="text-sm text-gray-500">{kpi.unit}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{kpi.description}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progreso</span>
          <span>{Math.round(getProgressPercentage())}% del objetivo</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              kpi.status === 'green'
                ? 'bg-success-500'
                : kpi.status === 'yellow'
                ? 'bg-warning-500'
                : 'bg-danger-500'
            }`}
            style={{ width: `${Math.min(100, getProgressPercentage())}%` }}
          ></div>
        </div>
      </div>

      {/* Target */}
      <div className="text-xs text-gray-500">
        Objetivo: {kpi.target.toLocaleString('es-MX')} {kpi.unit}
      </div>
    </div>
  )
}