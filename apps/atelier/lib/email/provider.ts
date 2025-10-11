/**
 * Email Provider Abstraction
 * Supports Postmark, Resend, and SendGrid
 */

interface EmailMessage {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
}

interface EmailProvider {
  send(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }>
}

class PostmarkProvider implements EmailProvider {
  private apiKey: string
  private fromEmail: string

  constructor(apiKey: string, fromEmail: string) {
    this.apiKey = apiKey
    this.fromEmail = fromEmail
  }

  async send(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': this.apiKey,
        },
        body: JSON.stringify({
          From: message.from || this.fromEmail,
          To: message.to,
          Subject: message.subject,
          HtmlBody: message.html,
          ReplyTo: message.replyTo || this.fromEmail,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, messageId: data.MessageID }
      } else {
        return { success: false, error: data.Message || 'Failed to send email' }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

class ResendProvider implements EmailProvider {
  private apiKey: string
  private fromEmail: string

  constructor(apiKey: string, fromEmail: string) {
    this.apiKey = apiKey
    this.fromEmail = fromEmail
  }

  async send(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: message.from || this.fromEmail,
          to: message.to,
          subject: message.subject,
          html: message.html,
          reply_to: message.replyTo || this.fromEmail,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, messageId: data.id }
      } else {
        return { success: false, error: data.error || 'Failed to send email' }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

class SendGridProvider implements EmailProvider {
  private apiKey: string
  private fromEmail: string

  constructor(apiKey: string, fromEmail: string) {
    this.apiKey = apiKey
    this.fromEmail = fromEmail
  }

  async send(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: message.to }],
          }],
          from: {
            email: message.from || this.fromEmail,
          },
          subject: message.subject,
          content: [{
            type: 'text/html',
            value: message.html,
          }],
          reply_to: {
            email: message.replyTo || this.fromEmail,
          },
        }),
      })

      if (response.ok) {
        const messageId = response.headers.get('X-Message-Id')
        return { success: true, messageId: messageId || undefined }
      } else {
        const data = await response.json()
        return { success: false, error: data.errors?.[0]?.message || 'Failed to send email' }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Factory function to create the appropriate provider
export function createEmailProvider(): EmailProvider | null {
  const provider = process.env.EMAIL_PROVIDER
  const apiKey = process.env.EMAIL_API_KEY
  const fromEmail = process.env.EMAIL_FROM

  if (!provider || !apiKey || !fromEmail) {
    console.warn('Email provider not configured. Emails will not be sent.')
    return null
  }

  switch (provider.toLowerCase()) {
    case 'postmark':
      return new PostmarkProvider(apiKey, fromEmail)
    case 'resend':
      return new ResendProvider(apiKey, fromEmail)
    case 'sendgrid':
      return new SendGridProvider(apiKey, fromEmail)
    default:
      console.warn(`Unknown email provider: ${provider}`)
      return null
  }
}

// Helper function to send emails
export async function sendEmail(message: EmailMessage) {
  const provider = createEmailProvider()

  if (!provider) {
    console.log('Email not sent (no provider configured):', message)
    return { success: false, error: 'Email provider not configured' }
  }

  return await provider.send(message)
}