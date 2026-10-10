import { About } from "@/components/home/About";
import { CaseStudies } from "@/components/home/CaseStudies";
import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
// import { Integrations } from "@/components/home/Integrations"; // "Semua kami urus" section hidden for now
import { Pricing } from "@/components/home/Pricing";
import { Process } from "@/components/home/Process";
import { Services } from "@/components/home/Services";
// import { Team } from "@/components/home/Team"; // "Komitmen kami" section hidden for now
// import { Testimonials } from "@/components/home/Testimonials"; // "Untuk siapa" section hidden for now
import { Values } from "@/components/home/Values";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Values />
      <Services />
      <Process />
      <CaseStudies />
      {/* <Integrations /> */}
      {/* <Testimonials /> */}
      <Pricing />
      {/* <Team /> */}
      <Faq />
    </>
  );
}
