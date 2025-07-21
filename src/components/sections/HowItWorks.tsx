'use client';

import { Camera, Search, BookOpen } from "lucide-react";
import { useLanguage } from "@/context/language";

const content = {
  en: {
    subtitle: "Simple Process",
    title: "How Mero Aushadhi Works",
    description: "Get started with these simple steps to access detailed information about your medicines",
    steps: [
      {
        name: "Scan Medicine",
        description: "Open the app and use your camera to scan the back of your medicine package.",
        icon: Camera,
      },
      {
        name: "Get Information",
        description: "Our app instantly processes the image and retrieves detailed information about your medicine.",
        icon: Search,
      },
      {
        name: "Learn & Understand",
        description: "Read through comprehensive details about dosage, side effects, and usage instructions.",
        icon: BookOpen,
      },
    ]
  },
  np: {
    subtitle: "सरल प्रक्रिया",
    title: "मेरो औषधि कसरी काम गर्छ",
    description: "तपाईंको औषधिहरूको बारेमा विस्तृत जानकारी प्राप्त गर्न यी सरल चरणहरूबाट सुरु गर्नुहोस्",
    steps: [
      {
        name: "औषधि स्क्यान गर्नुहोस्",
        description: "एप खोल्नुहोस् र आफ्नो औषधि प्याकेजको पछाडि स्क्यान गर्न क्यामेरा प्रयोग गर्नुहोस्।",
        icon: Camera,
      },
      {
        name: "जानकारी प्राप्त गर्नुहोस्",
        description: "हाम्रो एपले तुरुन्तै छविलाई प्रशोधन गर्छ र तपाईंको औषधिको बारेमा विस्तृत जानकारी प्राप्त गर्छ।",
        icon: Search,
      },
      {
        name: "सिक्नुहोस् र बुझ्नुहोस्",
        description: "डोज, साइड इफेक्ट्स, र प्रयोग निर्देशनहरूको बारेमा विस्तृत विवरणहरू पढ्नुहोस्।",
        icon: BookOpen,
      },
    ]
  }
} as const;

// yo how it works section ho landing page ko
export const HowItWorks = () => {
  const { lang } = useLanguage();
  const t = content[lang];

  return (
    <div id="how-it-works" className="bg-white py-24 sm:py-32 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-[#10b5f1]">
            {t.subtitle}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t.title}
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-700">
            {t.description}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {t.steps.map((step, index) => (
              <div key={step.name} className="flex flex-col items-center text-center">
                <dt className="flex flex-col items-center gap-y-4">
                  <div className="rounded-lg bg-[#10b5f1] p-3 ring-1 ring-[#10b5f1]/25">
                    <step.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="text-base font-semibold leading-7 text-gray-900">
                    {index + 1}. {step.name}
                  </div>
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-700">
                  <p className="flex-auto">{step.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}; 