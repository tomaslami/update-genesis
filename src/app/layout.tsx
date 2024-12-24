import type { Metadata } from "next";
import "./globals.css";
import { Nunito } from 'next/font/google'
import FloatingButton from "@/components/tools/FloatingButton";
import { TagManagerProvider } from "@/components/tools/TagManager";
import { GoogleAnalytics } from "@next/third-parties/google"


export const metadata: Metadata = {
  title: "Génesis",
  description: "Consultorio de Kinestesiología y Fisioterapia",
  keywords: ["Fisioterapia", "Rehabilitación", "Consultorio", "Génesis", "rehabilitación", "fisioterapia", "consultorio", "osteopatía para dolores musculares", "rehabilitación con RPG Buenos Aires", "solución para dolor cervical", "RPG Kinesiologia", "rpg kinesiologia", "postura corporal", "corregir postura espalda", "Rehabilitacion Postural Global", "dolores musculares", "recuperar movilidad"],
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