interface BadgeDeltaProps {
  value: number
  format?: 'number' | 'percentage'
  size?: 'sm' | 'md' | 'lg'
}

export function BadgeDelta({ value, format = 'percentage', size = 'md' }: BadgeDeltaProps) {
  const isPositive = value > 0
  const isNeutral = value === 0

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  const colorClasses = isNeutral
    ? 'bg-dark-surface text-text-secondary'
    : isPositive
    ? 'bg-success-500/10 text-success-500 border border-success-500/20'
    : 'bg-danger-500/10 text-danger-500 border border-danger-500/20'

  const formattedValue =
    format === 'percentage'
      ? `${isPositive ? '+' : ''}${value.toFixed(1)}%`
      : `${isPositive ? '+' : ''}${value.toLocaleString('es-MX')}`

  return (
    <span
      className={`
        inline-flex items-center gap-1
        rounded-full font-medium
        ${sizeClasses[size]}
        ${colorClasses}
      `}
    >
      {!isNeutral && (
        <span className="text-xs">
          {isPositive ? '↑' : '↓'}
        </span>
      )}
      {formattedValue}
    </span>
  )
}