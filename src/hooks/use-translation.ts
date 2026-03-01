
'use client';

import { useLanguage } from '@/context/language-context';
import en from '@/locales/en.json';
import te from '@/locales/te.json';

const translations = { en, te };

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: keyof typeof en) => {
    return translations[language][key] || key;
  };

  return { t, language };
}

    