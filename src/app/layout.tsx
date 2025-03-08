import type { Metadata } from "next";
import "./globals.css";
import { Nunito } from 'next/font/google'
import FloatingButton from "@/components/tools/FloatingButton";
import { TagManagerProvider } from "@/components/tools/TagManager";
import { GoogleAnalytics } from "@next/third-parties/google"


export const metadata: Metadata = {
  title: "Génesis",
  description: "Consultorio de Kinestesiología y Fisioterapia",
  keywords: [
    "Reeducación Postural Global",
    "Terapia postural",
    "Centro de rehabilitación",
    "Osteopatía",
    "Centro de Kinesiología",
    "Kinesiología",
    "Fisioterapia y Osteopatía",
    "RPG Kinesiología",
    "Centro de Osteopatía",
    "Rehabilitación Postural Global",
    "Osteópata",
    "Osteópata Zona Norte",
    "Terapia de RPG",
    "Centro especializado en postura",
    "Métodos de RPG",
    "Postura corporal y equilibrio",
    "Soluciones para una postura saludable",
    "Ejercicios para mejorar la postura",
    "Bienestar postural con RPG",
    "Sesiones de RPG en Buenos Aires"
  ]
};

const nunito = Nunito({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="es">
        <body className={nunito.className} >
          <GoogleAnalytics gaId="G-BNR9CJ65S6" />
          <TagManagerProvider>
            {children}
            <FloatingButton phoneNumber="5491122519048" />
          </TagManagerProvider>
        </body>
      </html>
    </>
  );
}