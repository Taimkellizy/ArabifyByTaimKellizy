import React, { useContext } from 'react';
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
