import { ReactNode } from 'react'
import { Card } from './Card'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  accent?: 'gold' | 'cyan' | 'violet'
  className?: string
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accent = 'gold',
  className = ''
}: KpiCardProps) {
  const accentColors = {
    gold: 'text-gold-500 border-gold-500/20',
    cyan: 'text-cyan-500 border-cyan-500/20',
    violet: 'text-violet-500 border-violet-500/20'
  }

  return (
    <Card className={`p-6 border-l-4 ${accentColors[accent]} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-text-primary">{value}</h3>
            {trend && (
              <span
                className={`text-sm font-medium ${
                  trend.direction === 'up'
                    ? 'text-success-500'
                    : 'text-danger-500'
                }`}
              >
                {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-text-tertiary">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg bg-dark-surface ${accentColors[accent]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}