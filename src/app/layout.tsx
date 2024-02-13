import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Génesis",
  description: "Consultorio de Kinestesiología y Fisioterapia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>

      <html lang="es">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com"></link>
          <link rel="preconnect" href="https://fonts.gstatic.com"></link>
          <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200&display=swap" rel="stylesheet"></link>
          <link rel="icon" href="/icons/pr_icon.ico" />
        </head>
        <body className='nunito' >{children}</body>
      </html>
    </>
  );
}