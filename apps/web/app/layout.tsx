import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '../components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_DOMAIN ?? 'https://example.com'),
  title: 'Alear Nexus — Prime Growth OS',
  description: 'Activa demanda. Convierte en contratos. Escala con control. Sistema probado para empresas ambiciosas.',
  keywords: 'growth, marketing, ventas, demanda, leads, conversión, sistema',
  openGraph: {
    title: 'Prime Growth OS',
    description: 'Sistema operativo de crecimiento para empresas ambiciosas',
    type: 'website',
    locale: 'es_MX',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}