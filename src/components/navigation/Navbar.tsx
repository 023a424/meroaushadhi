'use client';

import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useLanguage } from "@/context/language";

const navigation = {
  en: [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
  ],
  np: [
    { name: "सुविधाहरू", href: "#features" },
    { name: "कसरी काम गर्छ", href: "#how-it-works" },
  ]
} as const;

// yo navbar component ho
export const Navbar = () => {
  const { lang, setLang } = useLanguage();

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'np' : 'en');
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <nav className="flex items-center justify-between p-6 lg:px-8 max-w-7xl mx-auto" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <Logo width={32} height={32} />
            <span className="font-semibold text-xl text-gray-900">Mero Aushadhi</span>
          </Link>
        </div>
        <div className="flex gap-x-12">
          {navigation[lang].map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => scrollToSection(e, item.href)}
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-[#10b5f1] transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className="flex lg:flex-1 lg:justify-end items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="text-sm font-semibold text-gray-900 hover:text-[#10b5f1] transition-colors"
          >
            {lang === 'en' ? 'नेपाली' : 'English'}
          </button>
          <Link href="/auth">
            <Button size="sm">
              {lang === 'en' ? 'Get Started' : 'सुरु गर्नुहोस्'}
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}; 