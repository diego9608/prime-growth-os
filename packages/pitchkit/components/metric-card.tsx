import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  description?: string
  format?: 'currency' | 'percentage' | 'number'
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  description,
  format = 'number',
}: MetricCardProps) {
  const formatValue = () => {
    if (format === 'currency') {
      return `$${typeof value === 'number' ? value.toLocaleString() : value}`
    }
    if (format === 'percentage') {
      return `${value}%`
    }
    return value
  }

  const getTrendIcon = () => {
    if (!change) return <Minus className="h-4 w-4 text-stone-400" />
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getTrendColor = () => {
    if (!change) return 'text-stone-500'
    return change > 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-600">{title}</p>
        {change !== undefined && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>
      <p className="mt-2 text-3xl font-bold text-stone-900">{formatValue()}</p>
      {changeLabel && (
        <p className="mt-1 text-xs text-stone-500">{changeLabel}</p>
      )}
      {description && (
        <p className="mt-2 text-sm text-stone-600">{description}</p>
      )}
    </div>
  )
}