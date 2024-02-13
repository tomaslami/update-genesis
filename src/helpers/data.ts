export const CardProfessionalsElements = [
  {
    id: 1,
    img: '/GABRIELA.png',
    name: 'Lic. Gabriela de Marco',
    title: 'Osteopatía ',
    item1: 'Lic. Kinesiologia y Fisiatria Universidad San Martin',
    item2: 'Diplomatura Osteopatia EOM 2015-2020',
    item3: 'Actual kinesiologa del Hospital Santojanni',
    item4: ''
  },
  {
    id: 2,
    img: '/ORLANDO.png',
    name: 'Lic. Orlando Cáceres',
    title: 'RPG',
    item1: 'Lic. en kinesiología y fisiatría UBA',
    item2: 'Posgrado: “REEDUCATION POSTURALE GLOBALE” dictado por Phillip E. Souchard (2010)',
    item3: 'Experiencia en docencia en catedra de biomecánica  y kinesioterapia',
    item4: 'Experiencia laboral como kinesiólogo del Club Atlético Huracan'
  }
]

export const CarouselElements = [
  {
    id: 1,
    img: '../../carousel/Imagen1.jpg',
  },
  {
    id: 2,
    img: '../../carousel/Imagen7.webp',
  },
  {
    id: 3,
    img: '../../carousel/Imagen3.jpg',
  },
  {
    id: 4,
    img: '../../carousel/Imagen4.jpg',
  },
  {
    id: 5,
    img: '../../carousel/Imagen5.webp',
  },
  {
    id: 6,
    img: '../../carousel/Imagen6.webp',
  },
  {
    id: 7,
    img: '../../carousel/Imagen9.webp',
  },
  {
    id: 8,
    img: '../../carousel/Imagen8.webp',
  }
]

export const InfoCardElements = [
  {
    id: 1,
    title: 'R.P.G',
    description: 'El método RPG (Reeducacion Postural Global) es un método basado en la individualidad de cada paciente, partiendo de los síntomas que presenta para así detectar y tratar la causa.',
    information_added: 'El terapeuta evalúa la anatomía del paciente, sus puntos de tensión, sus dolencias y las posturas que adopta en estatica y en movimiento.',
    image: '/icons/BONES.svg'
  },
  {
    id: 2,
    title: 'QUIROPRAXIA',
    description: 'Es un método utilizado para diagnosticar, tratar y prevenir alteraciones del sistema músculo-esquelético, y de los desórdenes que puedan provocar en la función del sistema nervioso y la salud.',
    information_added: 'Esta indicado  para tratar dolores como dolor de espalda, dolor de cabeza, patologias relacionadas con la columna como pinzamientos, dolores articulares, entre otros.',
    image: '/icons/SKELETON.svg'
  },
  {
    id: 3,
    title: 'OSTEOPATIA',
    description: 'La Osteopatía es una terapéutica manual con bases filosóficas y científicas. La Osteopatía se basa en conocimientos científicos de la anatomía, fisiología y biomecánica.',
    information_added: 'El osteópata con maniobras manuales permite a la estructura corporal recuperar su movilidad normal y la salud perdidas.',
    image: '/icons/BODY.svg'
  },
]

export const FooterElements = [
  {
    id: 1,
    text: '+54 11 2251 9048',
    icon: '/icons/PHONE.svg',
    img_alt: 'Telefono de Génesis'
  },
  {
    id: 2,
    text: 'consultoriogenesis.caba@gmail.com',
    icon: '/icons/MAIL.svg',
    img_alt: 'Gmail de Génesis'
  },
  {
    id: 3,
    text: 'CABA - Paraguay y Talcahuano, Recoleta',
    icon: '/icons/UBI.svg',
    img_alt: 'Ubicación del consultorio Génesis'
  }
]

export const NavElements = [
  {
    id: 1,
    title: 'SERVICIOS',
    link: '#servicios'
  },
  {
    id: 2,
    title: 'NOSOTROS',
    link: '#nosotros'

  },
  {
    id: 3,
    title: 'PROFESIONALES',
    link: '#profesionales'
  },
  {
    id: 4,
    title: 'CONTACTO',
    link: '#contacto'
  }
]

export const variants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 }
    }
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 }
    }
  }
};

