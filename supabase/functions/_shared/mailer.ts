// Sends the booking confirmation email. Credentials are Supabase secrets and never reach the browser.
//
// Provider order:
//   1. Gmail SMTP — when GMAIL_USER and GMAIL_APP_PASSWORD are set. Delivers to any address
//      without a verified domain. Uses port 465 (implicit TLS); Supabase blocks ports 25 and 587.
//   2. Resend — when RESEND_API_KEY is set. Without a verified domain, Resend only delivers
//      to the Resend account owner's address.
import nodemailer from 'npm:nodemailer@6.9.16'
import { buildIcs, icsFileName } from './calendar.js'
import { buildConfirmationEmail } from './email.js'
import { BUSINESS } from './business.js'

const TIMEOUT_MS = 10000
const RESEND_DEFAULT_FROM = `${BUSINESS.name} <onboarding@resend.dev>`

type Message = { to: string; subject: string; html: string; text: string; ics: string; icsName: string }

async function sendWithGmail(message: Message, user: string, pass: string) {
  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass: pass.replace(/\s+/g, '') }, // Google shows app passwords in groups of four
    connectionTimeout: TIMEOUT_MS,
    greetingTimeout: TIMEOUT_MS,
    socketTimeout: TIMEOUT_MS,
  })
  await transport.sendMail({
    from: { name: BUSINESS.name, address: user },
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
    attachments: [
      { filename: message.icsName, content: message.ics, contentType: 'text/calendar; charset=utf-8; method=PUBLISH' },
    ],
  })
}

function toBase64(text: string) {
  let binary = ''
  for (const b of new TextEncoder().encode(text)) binary += String.fromCharCode(b)
  return btoa(binary)
}

async function sendWithResend(message: Message, apiKey: string) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: Deno.env.get('EMAIL_FROM') ?? RESEND_DEFAULT_FROM,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        attachments: [{ filename: message.icsName, content: toBase64(message.ics) }],
      }),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
  } finally {
    clearTimeout(timer)
  }
}

/** Returns true when the email was accepted for delivery. Never throws: a booking must not fail because of email. */
// deno-lint-ignore no-explicit-any
export async function sendBookingConfirmation(booking: any): Promise<boolean> {
  const { subject, html, text } = buildConfirmationEmail(booking, { siteUrl: Deno.env.get('SITE_URL') ?? undefined })
  const message: Message = {
    to: booking.customer.email,
    subject,
    html,
    text,
    ics: buildIcs(booking),
    icsName: icsFileName(booking),
  }

  const gmailUser = Deno.env.get('GMAIL_USER')
  const gmailPass = Deno.env.get('GMAIL_APP_PASSWORD')
  const resendKey = Deno.env.get('RESEND_API_KEY')

  try {
    if (gmailUser && gmailPass) {
      await sendWithGmail(message, gmailUser, gmailPass)
    } else if (resendKey) {
      await sendWithResend(message, resendKey)
    } else {
      console.warn('No email provider configured; skipping confirmation email')
      return false
    }
    return true
  } catch (err) {
    console.error('Confirmation email failed', err)
    return false
  }
}
