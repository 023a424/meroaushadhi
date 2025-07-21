import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { CTA } from "@/components/sections/CTA";
import { Navbar } from "@/components/navigation/Navbar";

// yo main page ho hamro app ko
export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-white">
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
    </>
  );
}
