import { useState } from 'react';
import SplitText from '../components/split_text';
import CodeWindow from '../components/CodeWindow';
import analyzeHTML from '../components/analyzeHTML';
import analyzeCSS from '../components/analyzeCSS';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faUpload, faCode } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import Confetti from 'react-confetti';
import { Link } from 'react-router-dom';

const Home = ({ text, lang }) => {
  // New State for the uploaded code
  const [uploadedCode, setUploadedCode] = useState(null);
  const [fileName, setFileName] = useState("");

  const [fileType, setFileType] = useState(null); // 'html' or 'css'
  const [warnings, setWarnings] = useState([]);
  const [score, setScore] = useState(null);
  const [downloadableCode, setDownloadableCode] = useState(null);
  const [confettiKey, setConfettiKey] = useState(0);

  // File Upload Logic
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    // --- DETECT FILE TYPE ---
    if (file.name.endsWith('.css')) {
      setFileType('css');
    } else if (file.name.endsWith('.html') || file.name.endsWith('.jsx') || file.name.endsWith('.js')) {
      setFileType('html');
    } else {
      setFileType('unknown');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedCode(event.target.result);
      // Reset previous results when new file is uploaded
      setScore(null);
      setWarnings([]);
      setDownloadableCode(null);
    };
    reader.readAsText(file);
  };

  const handleAnalysis = () => {
    if (fileType === 'html') {
      const { score, warnings } = analyzeHTML(uploadedCode, text);
      setWarnings(warnings);
      setScore(score);
      // You can't easily auto-fix HTML structure logic safely, 
      // so just show warnings for HTML.
      setConfettiKey(prev => prev + 1);
    }
    else if (fileType === 'css') {
      const { score, warnings, fixedCSS } = analyzeCSS(uploadedCode, text);
      setScore(score);
      setWarnings(warnings);
      // Save the fixed code to state so the user can download it
      setDownloadableCode(fixedCSS);
      setConfettiKey(prev => prev + 1);
    }
  };

  const downloadFile = (content, filename) => {
    // Create a "Blob" (Binary Large Object) from your string
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });

    // Create a fake URL for that blob
    element.href = URL.createObjectURL(file);
    element.download = "fixed-" + filename;

    // Fake a click to trigger download
    document.body.appendChild(element); // Required for FireFox
    element.click();
    document.body.removeChild(element);
  };

  // Helper logic to pick the class
  const getResultClass = () => {
    if (score === 100) return "res-green";
    if (score >= 70) return "res-yellow";
    return "res-red";
  };

  return (
    <div className="home-page">
      <div>
        <section className='hero-section'>
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

        <section className="code-section" id="tool">
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

        {uploadedCode && (
          <div className='analyse-btn'>

            {/* THE ANALYZE BUTTON */}
            <button onClick={handleAnalysis} className="btn">
              {text.analyzeBtn}
            </button>

            {/* THE DOWNLOAD BUTTON (Only shows if fixed code exists) */}
            {downloadableCode && (
              <button onClick={() => downloadFile(downloadableCode, fileName)} className="btn">
                {text.downloadFixed}
              </button>
            )}
          </div>
        )}
        {score !== null && (
          <div className={`results-section ${getResultClass()}`}>

            <h3>{text.score} {score}/100</h3>

            {score === 100 && (
              <>
                <Confetti
                  key={confettiKey}
                  width={window.innerWidth}
                  height={window.innerHeight}
                  recycle={false}
                  numberOfPieces={500}
                  style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
                />
              </>
            )}

            <ul style={{ padding: 0 }}>
              {warnings.map((warn, index) => (
                <li key={index} style={{ listStyle: 'none', marginBottom: '12px' }}>
                  {warn.blogID ? (
                    <Link
                      to={`/blog#post-${warn.blogID}`}
                      className="fix-link"
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        color: 'inherit',
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ lineHeight: '1.5' }}>•</span>
                      <span>
                        {warn.msg}
                        <span style={{
                          marginInlineStart: '8px',
                          color: 'var(--accent-color)',
                          textDecoration: 'underline',
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap',
                          display: 'inline-block'
                        }}>
                          {lang === 'ar' ? "كيف أصلحه؟" : "How to fix?"}
                        </span>
                      </span>
                    </Link>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{ lineHeight: '1.5' }}>•</span>
                      <span>{warn.msg}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>

          </div>
        )}
      </div>
    </div>
  );
};

export default Home;