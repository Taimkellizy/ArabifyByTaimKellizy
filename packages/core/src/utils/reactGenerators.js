export const contextTemplate = `import React, { createContext, useState, useEffect } from 'react';
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

  // 3. Side Effects (Update Dir, Storage, and Text)
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
`;

export const toggleTemplate = `import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

const LanguageToggle = () => {
    const { lang, toggleLanguage } = useContext(LanguageContext);

    return (
        <button onClick={toggleLanguage}>
            <span>{lang === 'en' ? 'EN' : 'AR'}</span>
        </button>
    );
}

export default LanguageToggle;
`;
