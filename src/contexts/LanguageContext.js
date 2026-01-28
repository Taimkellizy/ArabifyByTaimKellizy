import React, { createContext, useState, useEffect } from 'react';
import { content } from '../content';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // 1. Initialize logic
  const [lang, setLang] = useState(localStorage.getItem('appLang') || 'en');
  const [text, setText] = useState(content[lang]);

  // 2. Toggle Logic
  const toggleLanguage = () => {
    setLang((prevLang) => (prevLang === 'en' ? 'ar' : 'en'));
  };

  // 3. Side Effects (Update Dir & Storage)
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('appLang', lang);
    setText(content[lang]);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, text, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
