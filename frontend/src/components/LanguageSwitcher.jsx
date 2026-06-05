import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'HI' },
    { code: 'te', label: 'TE' },
  ];

  return (
    <div className="flex items-center gap-2 bg-navy/50 rounded-lg p-1 border border-white/10">
      <Globe className="w-4 h-4 text-neon-cyan" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
            language === lang.code
              ? 'bg-neon-cyan text-dark-blue'
              : 'text-white/60 hover:text-white'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
