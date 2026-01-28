import { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressBook, faPen } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';

const Header = () => {
    const { text } = useContext(LanguageContext);
    
    return (
    <header>
        <nav>
        <ul>
            {/* LOGO - Links to Home */}
            <li className="logo-item">
            <Link to="/" className="logo">
                <img src="./arabify-logo-4.svg" alt="logo" className='logo-img' />
            </Link>
            </li>

            {/* BLOG LINK */}
            <li>
            <Link to="/blog">
                <FontAwesomeIcon icon={faPen} className='icons-end' /> {text.blog}
            </Link>
            </li>

            {/* CONTACT LINK */}
            <li>
            <a href="https://www.linkedin.com/in/taimkellizy/" className="low_opacity_bg">
                <FontAwesomeIcon icon={faAddressBook} className='icons-end' /> {text.contact}
            </a>
            </li>

            {/* TOGGLE BUTTON */}
            <li>
                <LanguageToggle />
            </li>
        </ul>
        </nav>
    </header>
    );
};

export default Header;