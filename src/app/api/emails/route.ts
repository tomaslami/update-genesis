import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  // Resend se crea por request: a nivel de módulo rompe `next build` cuando no hay key
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not defined in environment variables')
    return NextResponse.json(
      {
        error: 'Server configuration error: Missing API key',
        details: 'Porfavor contacte al administrador del sitio'
      },
      { status: 500 }
    )
  }
  const resend = new Resend(resendApiKey)

  try {
    const body = await req.json()
    const { name, phone, message } = body

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['info@consultoriogenesis.com.ar'],
      subject: 'Nuevo contacto desde el formulario web',
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <p><strong>Mensaje:</strong> ${message}</p>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        {
          error: 'Failed to send email',
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}