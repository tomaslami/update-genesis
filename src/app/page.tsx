import AboutUs from "@/components/AboutUs";
import Carousel from "@/components/Carousel";
import Header from "@/components/Header";
import Info from "@/components/Info";
import PrincipalLanding from "@/components/PrincipalLanding";
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

      </main>
    </>
  );
}
