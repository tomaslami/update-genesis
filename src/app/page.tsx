import Header from "@/components/Header";
import PrincipalLanding from "@/components/PrincipalLanding";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <PrincipalLanding />
        <div className="w-full h-[500px]"></div>
      </main>
    </>
  );
}
