'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@ui/components/button'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: '/offers', label: 'Ofertas' },
    { href: '/proof', label: 'Casos' },
    { href: '/playbooks', label: 'Playbooks' },
  ]

  return (
    <nav className="fixed top-0 z-40 w-full border-b border-stone-200 bg-white/80 backdrop-blur-lg">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Prime Growth OS</span>
            <span className="text-xs text-gold-500">™</span>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
              >
                {link.label}
              </Link>
            ))}
            <Button variant="gold" size="sm">
              Hablar con ventas
            </Button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-stone-200 bg-white md:hidden">
          <div className="container py-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-stone-600"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Button variant="gold" size="sm" className="w-full">
                Hablar con ventas
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}