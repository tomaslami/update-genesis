import type { Metadata } from "next";
import "./globals.css";
import { Nunito } from 'next/font/google'
import FloatingButton from "@/components/tools/FloatingButton";
import { TagManagerProvider } from "@/components/tools/TagManager";

export const metadata: Metadata = {
  title: "Génesis",
  description: "Consultorio de Kinestesiología y Fisioterapia",
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
          <TagManagerProvider>
            {children}
            <FloatingButton phoneNumber="5491122519048" />
          </TagManagerProvider>
        </body>
      </html>
    </>
  );
}