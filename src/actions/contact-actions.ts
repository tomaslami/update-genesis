'use server'
import { Resend } from 'resend'
import axios from 'axios'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function handleSubmit(formData: FormData) {
  try {
    console.log('API Key exists:', !!process.env.RESEND_API_KEY)

    const name = formData.get('name')
    const phone = formData.get('phone')
    const message = formData.get('message')

    if (!name || !message || !phone) {
      console.log('Missing required fields')
      return {
        status: 500,
        message: 'Por favor complete todos los campos requeridos'
      }
    }

    const emailData = {
      name,
      phone,
      message
    }

    console.log('Attempting to send email with data:', emailData)

    try {
      const res = await axios.post(
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/api/emails"
          : "https://consultoriogenesis.com.ar/api/emails",
        emailData
      )

      console.log('Email sent successfully:', res.data)
      return res.data

    } catch (axiosError) {
      console.error('Axios error:', axiosError)

      // Fallback to Resend if axios request fails
      console.log('Attempting to send via Resend as fallback')
      const { data, error } = await resend.emails.send({
        from: 'info@consultoriogenesis.com.ar',
        to: ['matiasgabrielroldan@gmail.com'],
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
        throw new Error('Failed to send email via both methods')
      }

      console.log('Email sent successfully:', data)
      return {
        status: 200,
        message: 'Mensaje enviado exitosamente'
      }
    }

  } catch (error) {
    console.error('Full error object:', error)
    return {
      status: 500,
      message: 'Error al enviar el email. Por favor intente nuevamente.'
    }
  }
}

