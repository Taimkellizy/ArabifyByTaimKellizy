import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressBook, faPen, faGlobe } from '@fortawesome/free-solid-svg-icons';
// Make sure to import Link from router so the page doesn't refresh
import { Link } from 'react-router-dom'; 

const Header = ({ text, toggleLanguage }) => {
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

          {/* CONTACT LINK (Anchor tag is fine for scrolling if on Home, 
              but usually you might want a separate contact page later) */}
          <li>
            <a href="https://www.linkedin.com/in/taimkellizy/" className="low_opacity_bg">
              <FontAwesomeIcon icon={faAddressBook} className='icons-end' /> {text.contact}
            </a>
          </li>

          {/* TOGGLE BUTTON */}
          <li>
            <button onClick={toggleLanguage} className="lang-btn">
              <FontAwesomeIcon icon={faGlobe} className='icons-end' /> 
              {text.toggleBtn}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;