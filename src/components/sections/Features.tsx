'use client';

import { Scan, Pill, Clock, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/language";

const content = {
  en: {
    subtitle: "Powerful Features",
    title: "Everything you need to know about your medicines",
    description: "Our app provides comprehensive medicine information through simple scanning technology, making it easier for you to understand your medications.",
    features: [
      {
        name: "Quick Scanning",
        description: "Simply scan the back of your medicine packaging to get instant information.",
        icon: Scan,
      },
      {
        name: "Detailed Information",
        description: "Access comprehensive details about dosage, side effects, and usage instructions.",
        icon: Pill,
      },
      {
        name: "Real-time Availability",
        description: "Check medicine availability at nearby pharmacies in real-time.",
        icon: Clock,
      },
      {
        name: "Verified Data",
        description: "All information is verified and sourced from reliable medical databases.",
        icon: ShieldCheck,
      },
    ]
  },
  np: {
    subtitle: "शक्तिशाली सुविधाहरू",
    title: "तपाईंको औषधिको बारेमा जान्नुपर्ने सबै कुरा",
    description: "हाम्रो एपले सरल स्क्यानिङ प्रविधि मार्फत व्यापक औषधि जानकारी प्रदान गर्दछ, जसले तपाईंलाई आफ्नो औषधिहरू बुझ्न सजिलो बनाउँछ।",
    features: [
      {
        name: "द्रुत स्क्यानिङ",
        description: "तुरुन्त जानकारी प्राप्त गर्न आफ्नो औषधि प्याकेजिङको पछाडि स्क्यान गर्नुहोस्।",
        icon: Scan,
      },
      {
        name: "विस्तृत जानकारी",
        description: "डोज, साइड इफेक्ट्स, र प्रयोग निर्देशनहरूको बारेमा विस्तृत जानकारी प्राप्त गर्नुहोस्।",
        icon: Pill,
      },
      {
        name: "रियल-टाइम उपलब्धता",
        description: "नजिकैका फार्मेसीहरूमा औषधिको उपलब्धता रियल-टाइममा जाँच गर्नुहोस्।",
        icon: Clock,
      },
      {
        name: "प्रमाणित डाटा",
        description: "सबै जानकारी विश्वसनीय मेडिकल डाटाबेसबाट प्रमाणित र प्राप्त गरिएको छ।",
        icon: ShieldCheck,
      },
    ]
  }
} as const;

// yo features section ho landing page ko
export const Features = () => {
  const { lang } = useLanguage();
  const t = content[lang];

  return (
    <div id="features" className="py-24 sm:py-32 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
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
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {t.features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-[#10b5f1]" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-700">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}; 