'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import {
  LayoutDashboard,
  Users,
  Calculator,
  GitBranch,
  Truck,
  DollarSign,
  FileText,
  Building2,
  Brain,
  Settings,
  LogOut
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Strategy', href: '/strategy', icon: Brain },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'CPQ', href: '/cpq', icon: Calculator },
  { name: 'Stage Gate', href: '/stagegate', icon: GitBranch },
  { name: 'Proveedores', href: '/vendors', icon: Truck },
  { name: 'Finanzas', href: '/finance', icon: DollarSign },
  { name: 'Casos de Estudio', href: '/cases', icon: FileText },
]

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const authEnabled = process.env.NEXT_PUBLIC_FEATURE_AUTH === 'on'

  useEffect(() => {
    if (authEnabled) {
      const supabase = createClient()
      loadUser(supabase)

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })

      return () => subscription.unsubscribe()
    }
  }, [authEnabled])

  const loadUser = async (supabase: ReturnType<typeof createClient>) => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const handleSignOut = async () => {
    if (authEnabled) {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth/sign-in')
    }
  }

  return (
    <nav className="bg-dark-surface shadow-card border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 flex items-center">
              <Building2 className="h-8 w-8 text-gold-500" />
              <span className="ml-2 text-xl font-bold text-text-primary">Atelier</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-baseline space-x-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`nav-link ${isActive ? 'active' : ''} flex items-center space-x-2`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* User Menu */}
            {authEnabled && user && (
              <div className="relative ml-4">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-text-secondary hover:text-text-primary px-3 py-2 rounded-md"
                >
                  <div className="h-8 w-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
                    <span className="text-sm font-medium text-gold-500">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-dark-elevated rounded-lg shadow-card border border-dark-border py-1 z-50">
                    <div className="px-4 py-2 text-sm text-text-secondary border-b border-dark-border">
                      {user.email}
                    </div>
                    <Link
                      href="/settings/members"
                      className="flex items-center px-4 py-2 text-sm text-text-primary hover:bg-dark-surface"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configuración
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-text-primary hover:bg-dark-surface"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="bg-dark-surface p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-dark-elevated focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold-500"
            >
              <span className="sr-only">Abrir menú principal</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-dark-surface border-t border-dark-border">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-link ${isActive ? 'active' : ''} flex items-center space-x-2 w-full`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}