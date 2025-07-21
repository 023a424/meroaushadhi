'use client';

import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useLanguage } from "@/context/language";
import Link from "next/link";

const content = {
  en: {
    title: "Your Medicine Information",
    highlight: "Companion",
    description: "Scan your medicine packaging to instantly access detailed information about dosage, side effects, symptoms, and availability. Making medicine information accessible and easy to understand.",
    cta: {
      primary: "Get Started",
      secondary: "Learn More"
    }
  },
  np: {
    title: "तपाईंको औषधि जानकारी",
    highlight: "साथी",
    description: "औषधिको प्याकेजिङ स्क्यान गरेर डोज, साइड इफेक्ट्स, लक्षणहरू, र उपलब्धता बारे विस्तृत जानकारी तुरुन्तै प्राप्त गर्नुहोस्। औषधि जानकारी सजिलै बुझ्न सकिने बनाउँदै।",
    cta: {
      primary: "सुरु गर्नुहोस्",
      secondary: "थप जान्नुहोस्"
    }
  }
} as const;

// yo hero section ho landing page ko
export const Hero = () => {
  const { lang } = useLanguage();
  const t = content[lang];

  return (
    <div className="relative isolate pt-14">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <svg
          className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
          viewBox="0 0 1155 678"
        >
          <path
            fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
            fillOpacity=".2"
            d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
          />
          <defs>
            <linearGradient
              id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
              x1="1155.49"
              x2="-78.208"
              y1=".177"
              y2="474.645"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#10b5f1" />
              <stop offset={1} stopColor="#10b5f1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
          <h1 className="mt-10 max-w-lg text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            {t.title}{' '}
            <span className="text-[#10b5f1]">{t.highlight}</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-700">
            {t.description}
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link href="/auth">
              <Button size="lg">
                {t.cta.primary}
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              {t.cta.secondary}
            </Button>
          </div>
        </div>
        <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-[#10b5f1]/10 rounded-full mix-blend-multiply filter blur-2xl" />
            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-[#10b5f1]/20 rounded-full mix-blend-multiply filter blur-2xl" />
            <Logo width={400} height={400} className="relative z-10" />
          </div>
        </div>
      </div>
    </div>
  );
}; 