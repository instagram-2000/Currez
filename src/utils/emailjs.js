import emailjs from '@emailjs/browser'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

// Sends a lead-capture notification (Contact Us / Talk to Sales / Book a
// Demo / Get Onboarded) via EmailJS. Who actually receives it is
// configured in the EmailJS template itself (its "To email" field), not
// passed from here — that way a tampered client request can't redirect
// where these land.
export function sendLeadEmail({ name, phone, email, message, intent }) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    return Promise.reject(
      new Error('Email is not configured yet — set VITE_EMAILJS_SERVICE_ID / VITE_EMAILJS_TEMPLATE_ID / VITE_EMAILJS_PUBLIC_KEY.')
    )
  }

  return emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      intent,
      from_name: name,
      from_phone: phone,
      from_email: email || 'Not provided',
      message: message || '(no additional message)',
    },
    { publicKey: PUBLIC_KEY }
  )
}
