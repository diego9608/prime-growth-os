/**
 * Email Templates
 * Professional HTML email templates for Atelier
 */

export const emailTemplates = {
  // Base template wrapper
  base: (content: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Atelier</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8f9fa;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 500;
          margin: 20px 0;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
        }
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
        code {
          background-color: #f1f3f5;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
        .alert {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Atelier</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© 2024 Atelier - Gestión Integral para Estudios de Arquitectura</p>
          <p>
            <a href="#">Términos de servicio</a> |
            <a href="#">Política de privacidad</a> |
            <a href="#">Soporte</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Welcome email for new users
  welcome: (name: string, inviterName?: string) => {
    const content = `
      <h2>¡Bienvenido a Atelier!</h2>
      <p>Hola ${name},</p>
      ${inviterName
        ? `<p>${inviterName} te ha invitado a unirte a su equipo en Atelier.</p>`
        : `<p>Gracias por registrarte en Atelier.</p>`
      }
      <p>Atelier es la plataforma integral para la gestión de estudios de arquitectura. Con nosotros podrás:</p>
      <ul>
        <li>Gestionar leads y oportunidades comerciales</li>
        <li>Crear cotizaciones profesionales (CPQ)</li>
        <li>Administrar proyectos con Stage Gate</li>
        <li>Controlar proveedores y finanzas</li>
        <li>Optimizar estrategias con IA</li>
      </ul>
      <p style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Ir al Dashboard</a>
      </p>
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <p>¡Esperamos que disfrutes usando Atelier!</p>
    `
    return emailTemplates.base(content)
  },

  // Invitation email
  invitation: (inviterName: string, orgName: string, inviteUrl: string, role: string) => {
    const roleDescriptions = {
      owner: 'propietario con control total',
      admin: 'administrador con acceso completo',
      editor: 'editor con permisos de creación y edición',
      viewer: 'visualizador con acceso de solo lectura'
    }

    const content = `
      <h2>Has sido invitado a ${orgName}</h2>
      <p>${inviterName} te ha invitado a unirte a <strong>${orgName}</strong> en Atelier como <strong>${roleDescriptions[role as keyof typeof roleDescriptions] || role}</strong>.</p>

      <p>Para aceptar la invitación y crear tu cuenta, haz clic en el siguiente botón:</p>

      <p style="text-align: center;">
        <a href="${inviteUrl}" class="button">Aceptar Invitación</a>
      </p>

      <div class="alert">
        <strong>Nota:</strong> Este enlace de invitación expirará en 7 días. Si no has solicitado esta invitación, puedes ignorar este email.
      </div>

      <p>¿Qué es Atelier?</p>
      <p>Atelier es una plataforma integral para la gestión de estudios de arquitectura que te permite colaborar eficientemente con tu equipo en proyectos, cotizaciones y más.</p>
    `
    return emailTemplates.base(content)
  },

  // Password reset email
  passwordReset: (resetUrl: string) => {
    const content = `
      <h2>Restablecer tu contraseña</h2>
      <p>Has solicitado restablecer tu contraseña en Atelier.</p>

      <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>

      <p style="text-align: center;">
        <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
      </p>

      <div class="alert">
        <strong>Importante:</strong> Este enlace expirará en 1 hora. Si no has solicitado este cambio, puedes ignorar este email y tu contraseña permanecerá sin cambios.
      </div>

      <p>Si el botón no funciona, copia y pega esta URL en tu navegador:</p>
      <p><code>${resetUrl}</code></p>
    `
    return emailTemplates.base(content)
  },

  // Project notification
  projectUpdate: (projectName: string, updateType: string, details: string, projectUrl: string) => {
    const content = `
      <h2>Actualización del Proyecto: ${projectName}</h2>

      <p>Hay una nueva actualización en el proyecto <strong>${projectName}</strong>:</p>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #667eea;">${updateType}</h3>
        <p>${details}</p>
      </div>

      <p style="text-align: center;">
        <a href="${projectUrl}" class="button">Ver Proyecto</a>
      </p>

      <p>Mantente al día con todos los cambios del proyecto en tu dashboard de Atelier.</p>
    `
    return emailTemplates.base(content)
  },

  // Quote/CPQ notification
  quoteReady: (clientName: string, projectName: string, quoteUrl: string, totalAmount: string) => {
    const content = `
      <h2>Cotización Lista para Revisión</h2>

      <p>La cotización para <strong>${clientName}</strong> está lista para su revisión.</p>

      <table style="width: 100%; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; background-color: #f8f9fa;"><strong>Proyecto:</strong></td>
          <td style="padding: 10px; background-color: #f8f9fa;">${projectName}</td>
        </tr>
        <tr>
          <td style="padding: 10px;"><strong>Cliente:</strong></td>
          <td style="padding: 10px;">${clientName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background-color: #f8f9fa;"><strong>Monto Total:</strong></td>
          <td style="padding: 10px; background-color: #f8f9fa; font-size: 18px; color: #667eea;"><strong>${totalAmount}</strong></td>
        </tr>
      </table>

      <p style="text-align: center;">
        <a href="${quoteUrl}" class="button">Ver Cotización</a>
      </p>

      <p>La cotización incluye todos los detalles del proyecto, materiales, mano de obra y términos de pago.</p>
    `
    return emailTemplates.base(content)
  },

  // Weekly digest
  weeklyDigest: (stats: {
    newLeads: number
    activeProjects: number
    pendingQuotes: number
    upcomingDeadlines: Array<{ name: string; date: string }>
  }) => {
    const content = `
      <h2>Tu Resumen Semanal</h2>

      <p>Aquí está lo que sucedió en tu estudio esta semana:</p>

      <div style="display: flex; justify-content: space-around; text-align: center; margin: 30px 0;">
        <div>
          <h3 style="color: #667eea; margin: 0;">${stats.newLeads}</h3>
          <p style="margin: 5px 0; color: #6c757d;">Nuevos Leads</p>
        </div>
        <div>
          <h3 style="color: #667eea; margin: 0;">${stats.activeProjects}</h3>
          <p style="margin: 5px 0; color: #6c757d;">Proyectos Activos</p>
        </div>
        <div>
          <h3 style="color: #667eea; margin: 0;">${stats.pendingQuotes}</h3>
          <p style="margin: 5px 0; color: #6c757d;">Cotizaciones Pendientes</p>
        </div>
      </div>

      ${stats.upcomingDeadlines.length > 0 ? `
        <h3>Próximas Fechas Importantes</h3>
        <ul>
          ${stats.upcomingDeadlines.map(d => `
            <li><strong>${d.name}</strong> - ${d.date}</li>
          `).join('')}
        </ul>
      ` : ''}

      <p style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Ver Dashboard Completo</a>
      </p>

      <p>Mantén el momentum y sigue construyendo proyectos increíbles.</p>
    `
    return emailTemplates.base(content)
  }
}