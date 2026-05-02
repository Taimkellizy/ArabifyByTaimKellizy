export const getContextTemplate = (languages, defaultLang = 'en', isNextJs = false) => {
  const useClient = isNextJs ? '"use client";\n\n' : '';
  return `${useClient}import React, { createContext, useState, useEffect } from 'react';
import { content } from '../utils/content';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // 1. Initialize logic
  const [lang, setLang] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('appLang') : null) || '${defaultLang}');
  const [text, setText] = useState(content[lang]);
  
  // 2. Control Logic
  const _languages = ${JSON.stringify(languages)};
  const toggleLanguage = () => {
    const currentIdx = _languages.indexOf(lang);
    const nextIdx = (currentIdx + 1) % _languages.length;
    setLang(_languages[nextIdx]);
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
  };

  // 3. Side Effects (Update Dir, Storage, and Text)
  useEffect(() => {
    document.documentElement.lang = lang;
    const isRtl = ['ar', 'he', 'fa', 'ur'].includes(lang);
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    localStorage.setItem('appLang', lang);
    if(content[lang]) setText(content[lang]);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, text, toggleLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
`;
};

export const getI18nContextTemplate = (languages, defaultLang = 'en', isNextJs = false) => {
  const useClient = isNextJs ? '"use client";\n\n' : '';
  return `${useClient}import React, { createContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('appLang') : null) || i18n.language || '${defaultLang}');
  
  const _languages = ${JSON.stringify(languages)};
  const toggleLanguage = () => {
    const currentIdx = _languages.indexOf(lang);
    const nextIdx = (currentIdx + 1) % _languages.length;
    const newLang = _languages[nextIdx];
    setLang(newLang);
    i18n.changeLanguage(newLang);
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    const isRtl = ['ar', 'he', 'fa', 'ur'].includes(lang);
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    localStorage.setItem('appLang', lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
`;
};

export const getToggleTemplate = (languages, isNextJs = false) => {
  const useClient = isNextJs ? '"use client";\n\n' : '';
  if (languages.length > 2) {
    const options = languages.map(l => `                <option value="${l}">${l.toUpperCase()}</option>`).join('\n');
    return `${useClient}import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

const LanguageToggle = () => {
    const context = useContext(LanguageContext);
    const lang = context?.lang || '${languages[0]}';
    const changeLanguage = context?.changeLanguage || (() => console.warn('LanguageContext missing'));

    return (
        <select value={lang} onChange={(e) => changeLanguage(e.target.value)}>
${options}
        </select>
    );
}

export default LanguageToggle;
`;
  } else {
    // 2 or fewer languages, default dual-button
    return `${useClient}import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

const LanguageToggle = () => {
    const context = useContext(LanguageContext);
    const lang = context?.lang || '${languages[0]}';
    const toggleLanguage = context?.toggleLanguage || (() => console.warn('LanguageContext missing'));

    return (
        <button onClick={toggleLanguage}>
            <span>{lang === '${languages[0]}' ? '${languages[0].toUpperCase()}' : '${(languages[1] || languages[0]).toUpperCase()}'}</span>
        </button>
    );
}

export default LanguageToggle;
`;
  }
};
