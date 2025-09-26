import Link from 'next/link'
import { siteContent } from '@content/copy'

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-bold">Prime Growth OS™</h3>
            <p className="text-sm text-stone-600">
              Sistema operativo de crecimiento para empresas ambiciosas
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Enlaces</h4>
            <div className="flex flex-col gap-2">
              <Link href="/offers" className="text-sm text-stone-600 hover:text-stone-900">
                Ofertas
              </Link>
              <Link href="/proof" className="text-sm text-stone-600 hover:text-stone-900">
                Casos
              </Link>
              <Link href="/playbooks" className="text-sm text-stone-600 hover:text-stone-900">
                Playbooks
              </Link>
              <Link href="/legal/privacy" className="text-sm text-stone-600 hover:text-stone-900">
                Privacidad
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Contacto</h4>
            <div className="flex flex-col gap-2 text-sm text-stone-600">
              <a href={`mailto:${siteContent.footer.contact.email}`} className="hover:text-stone-900">
                {siteContent.footer.contact.email}
              </a>
              <a href={`tel:${siteContent.footer.contact.phone}`} className="hover:text-stone-900">
                {siteContent.footer.contact.phone}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-200 pt-8">
          <p className="text-center text-sm text-stone-600">
            {siteContent.footer.legal.copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}