import { About } from "@/components/home/About";
import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { Portfolio } from "@/components/home/Portfolio";
import { Pricing } from "@/components/home/Pricing";
import { Process } from "@/components/home/Process";
import { Services } from "@/components/home/Services";
import { Values } from "@/components/home/Values";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Values />
      <Services />
      <Process />
      <Portfolio />
      <Pricing />
      <Faq />
    </>
  );
}
