import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'

// Validate environment variables
// TODO: Uncomment after configuring env vars in Netlify
// if (typeof window === 'undefined') {
//   import('../lib/env-validator').then(m => m.validateEnv())
// }

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Atelier Dashboard - Gestión Integral para Estudios de Arquitectura',
  description: 'Dashboard profesional para la gestión completa de estudios de arquitectura: leads, CPQ, proyectos, proveedores y finanzas.',
  keywords: 'arquitectura, dashboard, gestión, CPQ, leads, proyectos, proveedores, finanzas',
  authors: [{ name: 'Prime Growth OS' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-dark-base">
          <Navigation />
          <main className="py-6">
            <div className="page-container">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}