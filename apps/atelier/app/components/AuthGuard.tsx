'use client'

import { AlertCircle, ExternalLink } from 'lucide-react'
import { getAuthStatus } from '@/lib/auth-status'

type AuthGuardProps = {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const authStatus = getAuthStatus()

  if (!authStatus.enabled) {
    return fallback || <AuthDisabledBanner message={authStatus.message} />
  }

  return <>{children}</>
}

function AuthDisabledBanner({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-base px-4">
      <div className="max-w-2xl w-full">
        <div className="card border-l-4 border-warning-500/50">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-warning-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Autenticación no disponible
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                {message || 'La funcionalidad de autenticación está desactivada.'}
              </p>

              <div className="bg-dark-surface rounded-lg p-4 mb-4">
                <p className="text-sm text-text-secondary mb-2">
                  <strong className="text-text-primary">Para activar autenticación:</strong>
                </p>
                <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
                  <li>Configura las variables de entorno en Netlify</li>
                  <li>Agrega <code className="text-cyan-500 bg-dark-elevated px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code></li>
                  <li>Agrega <code className="text-cyan-500 bg-dark-elevated px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
                  <li>Clear cache and redeploy</li>
                </ol>
              </div>

              <a
                href="/SUPABASE_SETUP.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-gold-500 hover:text-gold-400 transition-colors"
              >
                Ver guía de configuración
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  )
}
