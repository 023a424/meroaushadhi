'use client';

import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/language";
import Link from "next/link";

const content = {
  en: {
    title: "Start Using Mero Aushadhi Today",
    description: "Get instant access to comprehensive medicine information with just a simple scan. Sign up now and make informed decisions about your medications.",
    cta: {
      primary: "Get Started",
      secondary: "Learn More"
    }
  },
  np: {
    title: "आजै मेरो औषधि प्रयोग गर्न सुरु गर्नुहोस्",
    description: "एउटा सरल स्क्यानको साथ व्यापक औषधि जानकारीमा तुरुन्त पहुँच प्राप्त गर्नुहोस्। अहिले साइन अप गर्नुहोस् र आफ्नो औषधिहरूको बारेमा सूचित निर्णयहरू लिनुहोस्।",
    cta: {
      primary: "सुरु गर्नुहोस्",
      secondary: "थप जान्नुहोस्"
    }
  }
} as const;

// yo CTA section ho landing page ko
export const CTA = () => {
  const { lang } = useLanguage();
  const t = content[lang];

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="relative isolate overflow-hidden bg-[#10b5f1] px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t.title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white">
            {t.description}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/auth">
              <Button 
                size="lg" 
                className="bg-[#10b5f1] text-white hover:bg-[#0990c5] font-semibold shadow-lg border-0"
              >
                {t.cta.primary}
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-white border-2 border-white hover:bg-white/10 font-semibold shadow-lg"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.cta.secondary}
            </Button>
          </div>
          <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
            aria-hidden="true"
          >
            <circle cx={512} cy={512} r={512} fill="url(#gradient)" fillOpacity="0.3" />
            <defs>
              <radialGradient id="gradient">
                <stop stopColor="#fff" />
                <stop offset={1} stopColor="#fff" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};