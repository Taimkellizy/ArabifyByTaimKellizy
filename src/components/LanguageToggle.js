import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';

const LanguageToggle = () => {
    const { text, toggleLanguage } = useContext(LanguageContext);

    return (
        <button onClick={toggleLanguage} className="lang-btn">
            <FontAwesomeIcon icon={faGlobe} className='icons-end' />
            {text.toggleBtn}
        </button>
    );
}

export default LanguageToggle;
