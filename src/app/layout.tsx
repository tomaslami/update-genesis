import type { Metadata } from "next";
import "./globals.css";
import { Nunito } from 'next/font/google'
import FloatingButton from "@/components/tools/FloatingButton";

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
        <body className={nunito.className} >{children}
          <FloatingButton phoneNumber="5491122519048" />
        </body>

      </html>
    </>
  );
}