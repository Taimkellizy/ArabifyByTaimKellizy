import './App.css';
import { useState, useEffect } from 'react';
import { content } from './content';
import SplitText from './split_text.js';
import CodeWindow from './CodeWindow';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAddressBook, faPen, faGlobe, faCode, faCheck, faUpload} from '@fortawesome/free-solid-svg-icons';
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

  // New State for the uploaded code
  const [uploadedCode, setUploadedCode] = useState(null); 
  const [fileName, setFileName] = useState("");

  // File Upload Logic
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name); // Update the name

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedCode(event.target.result); // Update the code
    };
    reader.readAsText(file);
  };

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

            {/* LINKS */}
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
            <a className="btn" href="#tool">{text.herobtn1}<FontAwesomeIcon icon={faCode} className="icons-start" /></a>
            <a className="btn" href="https://github.com/Taimkellizy/ArabifyByTaimKellizy">{text.herobtn2}<FontAwesomeIcon icon={faGithub} className="icons-start" /></a>
          </div>
        </div>
      </section>
      
      <section className="code-section boarders">
        {/* THE CODE SECTION - Only shows if uploadedCode is not null */}
        {uploadedCode && (
          <div className="container">
            {/* We force the filename here to ensure it passes down */}
            <CodeWindow 
              code={uploadedCode} 
              fileName={fileName} 
              language="javascript" 
            />
          </div>
        )}
        {/* THE UPLOAD BUTTON */}
        <div>
          <input 
            type="file" 
            id="file-upload" 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
          <label htmlFor="file-upload" className="btn">
            {/* LOGIC: Change Text/Icon based on state */}
            <FontAwesomeIcon 
              icon={uploadedCode ? faCheck : faUpload} 
              className="icons-end" 
            />
            {uploadedCode ? text.fileUped : text.upFile}
          </label>
        </div>
      </section>
      
      <footer className="boarders">
        <p>{text.copyrights}</p>
      </footer>
    </div>
  );
}

export default App;