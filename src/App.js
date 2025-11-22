import './App.css';
import { useState, useEffect } from 'react';
import { content } from './content';
import SplitText from './split_text.js';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAddressBook, faPen, faGlobe, faCode} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

function App() {
  // Initialize state (check localStorage so it remembers the choice on refresh)
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('appLanguage') || 'en';
  });

  // Update the HTML tag whenever 'lang' changes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Save to localStorage
    localStorage.setItem('appLanguage', lang);
  }, [lang]);

  // Toggle Function
  const toggleLanguage = () => {
    setLang((prevLang) => (prevLang === 'en' ? 'ar' : 'en'));
  };

  // Helper to get current text
  const text = content[lang];
  const handleAnimationComplete = () => {console.log("animation finished");};


  return (
    <div className="App">
      <header className="boarders">
        <nav>
          <ul>
            {/* LOGO */}
            <li className="logo-item">
              <a href="#header" className="logo">
                <img src="./arabify-logo-3.svg" alt="logo" className='logo-img' />
              </a>
            </li>

            {/* LINKS (Using the text variable) */}
            <li>
              <a href="#tools">
                <FontAwesomeIcon icon={faPen} className='icons-end' /> {text.blog}
              </a>
            </li>
            <li>
              <a href="#contact" className="low_opacity_bg">
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
      <section className='boarders hero-section'>
        <SplitText 
          text={text.heroText} 
          className="hero-title"  
          mode={lang === 'ar' ? 'words' : 'chars'}
          delay={50} 
        />
        <div className="hero-content">
          <p className="hero-desc">{text.heropar}</p>
          <div className="btn-group">
            <a className="btn">{text.herobtn1}<FontAwesomeIcon icon={faCode} className="icons-start" href="#tool" /></a>
            <a className="btn" href="https://github.com/Taimkellizy/ArabifyByTaimKellizy">{text.herobtn2}<FontAwesomeIcon icon={faGithub} className="icons-start" /></a>
          </div>
        </div>
      </section>
      <footer className="boarders">
        <p>{text.copyrights}</p>
      </footer>
    </div>
  );
}

export default App;