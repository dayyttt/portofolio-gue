import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

interface FieldError {
  field: string
  message: string
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateFields(data: Partial<ContactFormData>): FieldError[] {
  const errors: FieldError[] = []

  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'Name is required.' })
  }

  if (!data.email || data.email.trim() === '') {
    errors.push({ field: 'email', message: 'Email is required.' })
  } else if (!validateEmail(data.email.trim())) {
    errors.push({ field: 'email', message: 'Email must be a valid email address.' })
  }

  if (!data.subject || data.subject.trim() === '') {
    errors.push({ field: 'subject', message: 'Subject is required.' })
  }

  if (!data.message || data.message.trim() === '') {
    errors.push({ field: 'message', message: 'Message is required.' })
  }

  return errors
}

function sendEmailNotification(data: ContactFormData): void {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `[Portfolio Contact] ${data.subject}`,
    text: `New contact form submission:\n\nName: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}\n\nMessage:\n${data.message}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message.replace(/\n/g, '<br>')}</p>
    `,
  }

  // Fire-and-forget: do not await, do not fail the response if email fails
  transporter.sendMail(mailOptions).catch((err) => {
    console.error('[Contact API] Failed to send email notification:', err)
  })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: Partial<ContactFormData>

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { errors: [{ field: 'body', message: 'Invalid JSON body.' }] },
      { status: 422 },
    )
  }

  const errors = validateFields(body)

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 422 })
  }

  const data = body as ContactFormData

  sendEmailNotification(data)

  return NextResponse.json(
    { success: true, message: 'Your message has been sent successfully.' },
    { status: 200 },
  )
}
