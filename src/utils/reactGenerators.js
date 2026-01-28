export const contextTemplate = `import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // 1. Initialize logic
  const [lang, setLang] = useState(localStorage.getItem('appLang') || 'en');
  
  // Placeholder for text logic - in a real app user would fetch dictionary here
  // For now we just provide the lang key
  
  // 2. Toggle Logic
  const toggleLanguage = () => {
    setLang((prevLang) => (prevLang === 'en' ? 'ar' : 'en'));
  };

  // 3. Side Effects (Update Dir & Storage)
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('appLang', lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage }}>
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
        <button onClick={toggleLanguage} style={{
            background: 'transparent',
            border: '1px solid currentColor',
            padding: '0.5rem 1rem',
            borderRadius: '50px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 10px'
        }}>
            <span>{lang === 'en' ? 'EN' : 'AR'}</span>
        </button>
    );
}

export default LanguageToggle;
`;
