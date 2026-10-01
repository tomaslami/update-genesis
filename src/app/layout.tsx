import type { Metadata } from "next";
import "./globals.css";
import { Nunito } from 'next/font/google'
import { TagManagerProvider } from "@/components/tools/TagManager";
import { GoogleAnalytics } from "@next/third-parties/google"


export const metadata: Metadata = {
  title: "Génesis",
  description: "Génesis: kinesiología, Osteopatía y RPG en Recoleta, CABA. Prevención, evaluación y tratamiento de alteraciones del movimiento y la función física.",
  keywords: [
    "RPG Kinesiología",
    "Centro de Osteopatía",
    "Rehabilitación Postural Global",
    "Osteopatía",
    "Corrección de postura",
    "Método RPG",
    "Especialistas en RPG",
    "Terapia de RPG",
    "Centro especializado en postura",
    "Ejercicios para mejorar la postura",
    "Educación postural con RPG",
    "Atención profesional en RPG",
    "Postura saludable con RPG",
    "RPG y equilibrio corporal",
    "Salud y bienestar postural",
    "Corrección de postura con RPG",
    "Reeducación corporal con RPG",
    "Educación corporal para la postura",
    "Tratamientos posturales RPG",
    "Ejercicios para el bienestar postural",
    "Reeducación postural personalizada",
    "Sesiones de RPG en Buenos Aires",
    "Kinesiología y RPG en CABA",
    "Centro de RPG y fisioterapia",
    "Técnicas avanzadas en RPG",
    "Consultorio especializado en RPG",
    "Ejercicios guiados de reeducación postural",
    "Kinesiólogos expertos en postura",
    "Cuidado integral con RPG",
    "Consultorio profesional de RPG"
  ]
};

const nunito = Nunito({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800'], variable: '--font-nunito' })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="es">
        <body className={`${nunito.variable} ${nunito.className}`}>
          <GoogleAnalytics gaId="G-BNR9CJ65S6" />
          <TagManagerProvider>
            {children}
          </TagManagerProvider>
        </body>
      </html>
    </>
  );
}