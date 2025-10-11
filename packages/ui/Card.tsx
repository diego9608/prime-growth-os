import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: 'gold' | 'cyan' | 'violet' | 'dark' | 'none'
}

export function Card({ children, className = '', hover = false, gradient = 'none' }: CardProps) {
  const gradientClasses = {
    gold: 'bg-gradient-gold',
    cyan: 'bg-gradient-cyan',
    violet: 'bg-gradient-violet',
    dark: 'bg-gradient-dark',
    none: 'bg-dark-elevated'
  }

  return (
    <div
      className={`
        ${gradientClasses[gradient]}
        rounded-card
        shadow-card
        ${hover ? 'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}