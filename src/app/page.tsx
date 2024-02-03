import AboutUs from "@/components/AboutUs";
import Carousel from "@/components/Carousel";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Info from "@/components/Info";
import PrincipalLanding from "@/components/PrincipalLanding";
import Professionals from "@/components/Professionals";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Header />
      <main className="">
        <PrincipalLanding />
        <Info />
        <AboutUs />
        <Carousel />
        <Professionals />
        <Footer />
      </main>
    </>
  );
}
