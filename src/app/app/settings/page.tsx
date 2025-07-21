'use client';

import { useLanguage } from '@/context/language';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const content = {
  en: {
    title: 'Settings',
    languageSection: 'Language',
    languages: {
      english: 'English',
      nepali: 'नेपाली'
    },
    back: 'Back to App'
  },
  np: {
    title: 'सेटिङहरू',
    languageSection: 'भाषा',
    languages: {
      english: 'English',
      nepali: 'नेपाली'
    },
    back: 'एपमा फर्कनुहोस्'
  }
} as const;

export default function SettingsPage() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const t = content[lang];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="group flex items-center gap-2 hover:bg-[#0ea0d9]/5 border-none shadow-none text-gray-600 hover:text-[#0ea0d9] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            {t.back}
          </Button>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-100">
            <h1 className="text-2xl font-semibold text-gray-900">{t.title}</h1>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">{t.languageSection}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <button
                      onClick={() => setLang('en')}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                        lang === 'en'
                          ? 'bg-[#0ea0d9] text-white shadow-md hover:bg-[#0ea0d9]/90'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-medium">{t.languages.english}</span>
                        {lang === 'en' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-white"
                          />
                        )}
                      </div>
                    </button>
                  </motion.div>

                  <motion.div whileTap={{ scale: 0.98 }}>
                    <button
                      onClick={() => setLang('np')}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                        lang === 'np'
                          ? 'bg-[#0ea0d9] text-white shadow-md hover:bg-[#0ea0d9]/90'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-medium">{t.languages.nepali}</span>
                        {lang === 'np' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-white"
                          />
                        )}
                      </div>
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 