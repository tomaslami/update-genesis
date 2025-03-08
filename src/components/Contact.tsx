"use client"
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { handleSubmit } from '@/actions/contact-actions'
import { toast, Toaster } from "sonner"
import { useState } from 'react'


interface ButtonProps {
  message?: string
}

export default function Contact({ message = '¡Hola! Me contacto desde el sitio web de Génesis - RPG, Quiropraxia y Osteopatía. Estoy interesado/a en más información sobre sus servicios.' }: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/5491122519048?text=${encodedMessage}`


  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      const res = await handleSubmit(formData)

      if (res.status === 200) {
        toast.success(res.message)
        // Reset the form
        const form = document.querySelector("form") as HTMLFormElement
        form?.reset()
      } else {
        const messages = Array.isArray(res.message) ? res.message : [res.message]
        messages.forEach((msg: string) => toast.error(msg))
      }
    } catch {
      toast.error("Error al enviar el mensaje")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <section id="contacto" className="py-20 bg-white px-[5%]">
      <Toaster position="top-center" duration={3000} richColors />
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Contáctanos</h2>
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/2 flex flex-col gap-10">
            <form action={onSubmit} className="space-y-4 pb-10">
              <input type="text" name='name' placeholder="Nombre" className="w-full p-3 rounded-md border border-gray-300 " required />
              <input type="tel" name='phone' placeholder="Teléfono" className="w-full p-3 rounded-md border border-gray-300 " required />
              <textarea placeholder="Mensaje" name='message' rows={5} className="resize-none w-full p-3 rounded-md border border-gray-300 " required></textarea>
              <button type="submit" className="bg-[#002337] text-white font-bold py-3 px-6 rounded-md  transition duration-300"> {isLoading ? "Enviando..." : "Enviar"}</button>
            </form>
            <ul className='w-6 flex justify-start items-center gap-6'>
              <li>
                <Link target='_blank' href="https://www.instagram.com/consultoriogenesis.caba/">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#002337" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3" /></svg>
                </Link>
              </li>
              <li>
                <Link target='_blank' href="https://www.facebook.com/consultoriogenesis.caba">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="#002337" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 2h-3a5 5 0 0 0-5 5v3H6v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </Link>
              </li>
              <li>
                <Link href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#002337" d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07c0 1.22.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28" /></svg>
                </Link>
              </li>
            </ul>
          </div>
          <div className='w-max h-1/2 md:h-full flex flex-col justify-center items-center gap-5 order-2 lg:order-1'>

          </div>
          <div className="md:w-1/2">
            <div className="space-y-6">
              <div className="flex items-center">
                <PhoneIcon className="w-6 h-6 text-[#002337] mr-4" />
                <span>+54 11 2251 9048</span>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="w-6 h-6 text-[#002337] mr-4" />
                <span>CABA, Paraguay 1275</span>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="w-6 h-6 text-[#002337] mr-4" />
                <span>consultoriogenesis.caba@gmail.com</span>
              </div>
            </div>
            <div className="mt-8">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0168878895174!2d-58.38383908417407!3d-34.59640688046189!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccaa21c1d890d%3A0x51f706465e9331e5!2sParaguay%201275%2C%20C1057AAU%20CABA%2C%20Argentina!5e0!3m2!1sen!2sus!4v1653669972079!5m2!1sen!2sus"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section >
  )
}

