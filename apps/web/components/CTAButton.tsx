'use client'
import { useGAEvent } from '@prime-growth-os/analytics/provider'
import { Button } from '@prime-growth-os/ui/components/button'
import Link from 'next/link'

interface CTAButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'gold'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  eventName?: string
  eventParams?: Record<string, any>
}

export default function CTAButton({ href, children, variant = 'gold', size = 'lg', eventName, eventParams }: CTAButtonProps) {
  const trackEvent = useGAEvent()

  const handleClick = () => {
    if (eventName) {
      trackEvent(eventName, eventParams)
    }
  }

  return (
    <Link href={href} onClick={handleClick}>
      <Button variant={variant} size={size}>
        {children}
      </Button>
    </Link>
  )
}