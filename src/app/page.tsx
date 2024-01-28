import AboutUs from "@/components/AboutUs";
import Header from "@/components/Header";
import Info from "@/components/Info";
import PrincipalLanding from "@/components/PrincipalLanding";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <PrincipalLanding />
        <Info />
        <AboutUs />
      </main>
    </>
  );
}
