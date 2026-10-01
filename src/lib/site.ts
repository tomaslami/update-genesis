export const WHATSAPP_NUMBER = '5491122519048'
export const WHATSAPP_MESSAGE =
  '¡Hola! Me contacto desde el sitio web de Génesis - Kinesiología, RPG y Osteopatía. Estoy interesado/a en más información sobre sus servicios.'
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

export const CONTACT = {
  phone: '+54 11 2251 9048',
  email: 'consultoriogenesis.caba@gmail.com',
  address: 'Paraguay 1275, Recoleta, CABA',
  instagram: 'https://www.instagram.com/consultoriogenesis.caba/',
  facebook: 'https://www.facebook.com/consultoriogenesis.caba',
}

export const SECTIONS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'kinesiologia', label: 'Kinesiología' },
  { id: 'abordaje', label: 'Qué abordamos' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'metodo', label: 'Cómo trabajamos' },
  { id: 'nosotros', label: 'Nosotros' },
  { id: 'profesionales', label: 'Profesionales' },
  { id: 'consultorio', label: 'Consultorio' },
  { id: 'contacto', label: 'Contacto' },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']

export const sectionNumber = (id: SectionId) =>
  String(SECTIONS.findIndex((s) => s.id === id) + 1).padStart(2, '0')
