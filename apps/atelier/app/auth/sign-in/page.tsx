'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AuthGuard } from '@/app/components/AuthGuard'

function SignInContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-base py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center shadow-glow-gold">
              <span className="text-3xl font-bold text-dark-base">C</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-text-primary">
            Bienvenido a Cuarzo
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Inicia sesión para continuar
          </p>
          <p className="mt-4 text-center text-sm text-text-secondary">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/sign-up" className="font-medium text-gold-500 hover:text-gold-400">
              Regístrate aquí
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-text-secondary mb-1.5">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link href="/auth/reset" className="text-sm font-medium text-gold-500 hover:text-gold-400">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {error && (
            <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 p-4">
              <div className="text-sm text-danger-500">{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 bg-gradient-gold text-dark-base font-semibold rounded-lg shadow-glow-gold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-dark-base disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <div className="text-center pt-4 border-t border-dark-border">
            <p className="text-xs text-text-tertiary">
              Powered by <span className="text-gold-500 font-medium">Alear OS</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <AuthGuard>
      <SignInContent />
    </AuthGuard>
  )
}