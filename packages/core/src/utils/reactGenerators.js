export const getContextTemplate = (languages, defaultLang = 'en') => {
  return `import React, { createContext, useState, useEffect } from 'react';
import { content } from '../utils/content';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // 1. Initialize logic
  const [lang, setLang] = useState(localStorage.getItem('appLang') || '${defaultLang}');
  const [text, setText] = useState(content[lang]);
  
  // 2. Control Logic
  const toggleLanguage = () => {
    setLang((prevLang) => (prevLang === '${languages[0]}' ? '${languages[1] || languages[0]}' : '${languages[0]}'));
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

export const getI18nContextTemplate = (languages, defaultLang = 'en') => {
  return `import React, { createContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(localStorage.getItem('appLang') || i18n.language || '${defaultLang}');
  
  const toggleLanguage = () => {
    const newLang = lang === '${languages[0]}' ? '${languages[1] || languages[0]}' : '${languages[0]}';
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

export const getToggleTemplate = (languages) => {
  if (languages.length > 2) {
    const options = languages.map(l => `                <option value="${l}">${l.toUpperCase()}</option>`).join('\\n');
    return `import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

const LanguageToggle = () => {
    const { lang, changeLanguage } = useContext(LanguageContext);

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
    return `import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

const LanguageToggle = () => {
    const { lang, toggleLanguage } = useContext(LanguageContext);

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
