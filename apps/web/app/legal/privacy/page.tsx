import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <section className="section-padding">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h1 className="mb-8 text-3xl font-bold">Política de Privacidad</h1>

              <div className="prose prose-stone max-w-none">
                <p className="text-lg">Última actualización: Enero 2024</p>

                <h2 className="mt-8 text-2xl font-semibold">1. Información que recopilamos</h2>
                <p>
                  En Prime Growth OS, recopilamos información que nos proporcionas directamente, como tu nombre,
                  correo electrónico, número de teléfono y detalles de tu empresa cuando completas formularios
                  o nos contactas.
                </p>

                <h2 className="mt-8 text-2xl font-semibold">2. Cómo usamos tu información</h2>
                <p>Utilizamos la información recopilada para:</p>
                <ul className="list-disc pl-6">
                  <li>Responder a tus consultas y solicitudes</li>
                  <li>Proporcionarte servicios y soporte</li>
                  <li>Enviarte actualizaciones sobre nuestros servicios</li>
                  <li>Mejorar nuestros productos y servicios</li>
                  <li>Cumplir con obligaciones legales</li>
                </ul>

                <h2 className="mt-8 text-2xl font-semibold">3. Compartir información</h2>
                <p>
                  No vendemos, alquilamos ni compartimos tu información personal con terceros para sus propósitos
                  de marketing. Podemos compartir información con proveedores de servicios que nos ayudan a operar
                  nuestro negocio.
                </p>

                <h2 className="mt-8 text-2xl font-semibold">4. Seguridad</h2>
                <p>
                  Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal
                  contra acceso no autorizado, pérdida o alteración.
                </p>

                <h2 className="mt-8 text-2xl font-semibold">5. Cookies y tecnologías de seguimiento</h2>
                <p>
                  Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web,
                  analizar el tráfico y personalizar el contenido. Puedes configurar tu navegador para rechazar cookies.
                </p>

                <h2 className="mt-8 text-2xl font-semibold">6. Tus derechos</h2>
                <p>Tienes derecho a:</p>
                <ul className="list-disc pl-6">
                  <li>Acceder a tu información personal</li>
                  <li>Corregir información inexacta</li>
                  <li>Solicitar la eliminación de tu información</li>
                  <li>Oponerte al procesamiento de tu información</li>
                  <li>Retirar tu consentimiento en cualquier momento</li>
                </ul>

                <h2 className="mt-8 text-2xl font-semibold">7. Cambios a esta política</h2>
                <p>
                  Podemos actualizar esta política de privacidad periódicamente. Te notificaremos sobre cambios
                  significativos publicando la nueva política en nuestro sitio web.
                </p>

                <h2 className="mt-8 text-2xl font-semibold">8. Contacto</h2>
                <p>
                  Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tu información,
                  contáctanos en:
                </p>
                <p>
                  Email: privacy@primegrowth.os<br />
                  Teléfono: +52 55 1234 5678
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}