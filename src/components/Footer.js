import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

const Footer = () => {
    const { text } = useContext(LanguageContext);
    return (
        <footer>
            <a href="mailto:taimkellizy@gmail.com">{text.copyrights}</a>
        </footer>
    );
};

export default Footer;