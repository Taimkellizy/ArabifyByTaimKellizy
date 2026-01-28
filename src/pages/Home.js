import { useState, useRef, useEffect, useContext } from 'react';
import SplitText from '../components/split_text';
import CodeWindow from '../components/CodeWindow';
import analyzeHTML from '../components/analyzeHTML';
import analyzeCSS from '../components/analyzeCSS';
import analyzeJSX from '../components/analyzeJSX';
import ConfigWizard from '../components/ConfigWizard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faUpload, faCode, faFolderOpen, faFile, faChevronDown, faFileImage, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faHtml5, faCss3, faReact } from '@fortawesome/free-brands-svg-icons';
import Confetti from 'react-confetti';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';
import { LanguageContext } from '../contexts/LanguageContext';
import { contextTemplate, toggleTemplate } from '../utils/reactGenerators';

const Home = () => {
    const { text, lang } = useContext(LanguageContext);
  // State for uploaded files
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [results, setResults] = useState([]); // Array of { fileName, score, warnings, fixedCode, type }
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const uploadMenuRef = useRef(null);

  // Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [analysisConfig, setAnalysisConfig] = useState(null);

  // Close upload menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(event.target)) {
        setShowUploadMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // File Upload Logic
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setShowUploadMenu(false);

    // Promise based file reading
    const readPromises = files.map(file => {
      return new Promise((resolve) => {
        let type = 'unknown';
        if (file.name.endsWith('.css')) type = 'css';
        else if (file.name.endsWith('.html')) type = 'html';
        else if (file.name.endsWith('.jsx') || file.name.endsWith('.tsx') || file.name.endsWith('.js')) type = 'jsx';

        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            name: file.name,
            path: file.webkitRelativePath || file.name, // Use relative path if available (folder upload)
            content: event.target.result,
            type: type,
            originalFile: file // Keep original file for non-text/binary files if needed later
          });
        };
        reader.readAsText(file);
      });
    });

    Promise.all(readPromises).then(files => {
      setUploadedFiles(files);
      setResults([]); // Reset results
      setAnalysisConfig(null); // Reset config on new upload
    });
  };

  // Trigger Analysis (Shows Wizard First)
  const initiateAnalysis = () => {
    if (uploadedFiles.length === 0) return;
    setShowWizard(true);
  };

  const handleWizardStart = (config) => {
    setAnalysisConfig(config);
    setShowWizard(false);
    runAnalysis(config);
  };

  const runAnalysis = async (config) => {
    setIsAnalyzing(true);
    const newResults = [];
    let allPerfect = true;
    
    // Track global project stats
    const projectStats = {
      foundTags: new Set()
    };

    for (const file of uploadedFiles) {
      // Only analyze supported types
      if (file.type === 'unknown') continue;

      let result = { fileName: file.name, path: file.path, type: file.type, score: 0, warnings: [], fixedCode: null };

      if (file.type === 'html') {
        const isMain = file.name === config.htmlFileName;
        // For Vanilla: Check structure locally on EVERY HTML file.
        // For React: Only check structure globally (aggregated later), so don't check locally here.
        const checkStructureLocally = config.projectType === 'vanilla';

        const { score, warnings, foundTags, fixedCode } = analyzeHTML(file.content, text, { 
            isMainFile: isMain,
            checkStructure: checkStructureLocally,
            mode: config.mode,
            isReact: config.projectType === 'react'
        });
        if (foundTags) foundTags.forEach(t => projectStats.foundTags.add(t));
        result = { ...result, score, warnings, fixedCode };
      } else if (file.type === 'css') {
        const { score, warnings, fixedCSS } = await analyzeCSS(file.content, text);
        // Only attach fixedCode if mode is 'fix'
        result = {
          ...result,
          score,
          warnings,
          fixedCode: config.mode === 'fix' ? fixedCSS : null
        };
      } else if (file.type === 'jsx') {
        const { score, warnings, foundTags, fixedCode } = analyzeJSX(file.content, text, {
             mode: config.mode,
             // Check exact name OR path ending (e.g. src/App.js)
             isAppFile: (file.name === config.appFileName || file.path.endsWith(`/${config.appFileName}`))
        });
        if (foundTags) foundTags.forEach(t => projectStats.foundTags.add(t));
        result = { ...result, score, warnings, fixedCode };

        // Multi-Lang Logic Check
        if (config.mode === 'multi-lang' && config.projectType !== 'vanilla' && file.name === config.appFileName) {
          // Simple Heuristic Check for Context/Provider/Dir Logic
          const content = file.content;
          // Looking for common patterns like <LanguageContext.Provider>, <IntlProvider>, or logic handling direction
          const hasLangLogic =
            content.includes('Context') ||
            content.includes('Provider') ||
            (content.includes('dir') && content.includes('?')); // rudimentary check for conditional dir

          if (!hasLangLogic) {
            result.score = Math.max(0, result.score - 20);
            result.warnings.push({
              type: text.errtypeLanguage, // use existing key
              msg: text.msgMissingLangLogic,
              blogID: 5
            });
          }
        }
      }

      if (result.score < 100) allPerfect = false;
      newResults.push(result);
    }

    // --- Post-Loop Global Checks (React Only) ---
    if (config.projectType === 'react') {
        const missingTags = [];
        if (!projectStats.foundTags.has('header')) missingTags.push('<header>');
        if (!projectStats.foundTags.has('footer')) missingTags.push('<footer>');
        if (!projectStats.foundTags.has('main')) missingTags.push('<main>');

        if (missingTags.length > 0) {
            // Find the main file to attach warnings to, or the first file
            const targetFileIndex = newResults.findIndex(r => r.fileName === config.appFileName);
            // If main file not found in results (e.g. not uploaded), attach to first result
            const finalTargetIndex = targetFileIndex !== -1 ? targetFileIndex : 0;
            
            if (newResults[finalTargetIndex]) {
                const globalWarnings = missingTags.map(tag => ({
                    type: text.errtypeStructure,
                    msg: `${text.errPreSemantic} ${tag} ${text.errPostSemantic} (Global Check)`,
                    blogID: 1
                }));
                
                newResults[finalTargetIndex].warnings.push(...globalWarnings);
                // Deduct 10 points for each missing global structure item
                newResults[finalTargetIndex].score = Math.max(0, newResults[finalTargetIndex].score - (globalWarnings.length * 10));
                
                // Re-evaluate perfection if we added warnings
                if (newResults[finalTargetIndex].score < 100) allPerfect = false;
            }
        }
    }

    setResults(newResults);
    setIsAnalyzing(false);
    if (allPerfect && newResults.length > 0) {
      setConfettiKey(prev => prev + 1);
    }
  };

  const downloadAllFixed = async () => {
    const zip = new JSZip();

    // We want to include ALL uploaded files.
    // If a file was fixed, use the fixed content.
    // Otherwise, use the original content.

    uploadedFiles.forEach(file => {
      const fixedResult = results.find(r => r.path === file.path);
      const contentToSave = (fixedResult && fixedResult.fixedCode) ? fixedResult.fixedCode : file.content;

      // Use the relative path to preserve folder structure
      zip.file(file.path, contentToSave);
    });

    // --- MULTI-LANG INJECTION (React Only) ---
    if (analysisConfig && analysisConfig.mode === 'multi-lang' && analysisConfig.projectType === 'react') {
        // Find the root folder (where App.js is located)
        // Heuristic: Use the folder containing the App File as the "src" root
        const appFile = uploadedFiles.find(f => f.name === analysisConfig.appFileName || f.path.endsWith(`/${analysisConfig.appFileName}`));
        let srcPrefix = '';
        if (appFile) {
            // e.g. "my-project/src/App.js" -> "my-project/src/"
            const parts = appFile.path.split('/');
            parts.pop(); // remove filename
            srcPrefix = parts.join('/') + (parts.length > 0 ? '/' : '');
        }

        // Add Context
        zip.file(srcPrefix + 'contexts/LanguageContext.js', contextTemplate);
        
        // Add Toggle (Assuming components folder implies src/components)
        // If srcPrefix ends in 'src/', we get 'src/components/LanguageToggle.js'
        zip.file(srcPrefix + 'components/LanguageToggle.js', toggleTemplate);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(content);
    element.download = "fixed-project.zip";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadSingleFile = (content, filename) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "fixed-" + filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Helper logic to pick the class
  const getResultClass = (score) => {
    if (score === 100) return "res-green";
    if (score >= 70) return "res-yellow";
    return "res-red";
  };

  // Helper to get icon based on file type
  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.html')) return faHtml5;
    if (fileName.endsWith('.css')) return faCss3;
    if (fileName.endsWith('.js') || fileName.endsWith('.jsx') || fileName.endsWith('.tsx')) return faReact;
    if (fileName.match(/\.(jpg|jpeg|png|gif|svg)$/i)) return faFileImage;
    return faFileAlt;
  };

  return (
    <div className="home-page">
      {showWizard && (
        <ConfigWizard
          onStart={handleWizardStart}
          onCancel={() => setShowWizard(false)}
        />
      )}

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
          {/* THE CODE SECTION */}
          {uploadedFiles.length === 1 && (
            <div className="container">
              <CodeWindow
                code={uploadedFiles[0].content}
                fileName={uploadedFiles[0].name}
                language="javascript"
              />
            </div>
          )}

          {uploadedFiles.length > 1 && (
            <div className="container" style={{ padding: '20px' }}>
              <h3 className="file-list-header">
                {uploadedFiles.length} {text.files}
              </h3>
              <div className="file-grid">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="file-item">
                    <FontAwesomeIcon icon={getFileIcon(f.name)} className="file-icon" />
                    <span className="file-name" title={f.path}>
                      {f.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UNIFIED UPLOAD BUTTON */}
          <div className="upload-container" ref={uploadMenuRef}>

            <button
              className="btn upload-btn-main"
              onClick={() => setShowUploadMenu(!showUploadMenu)}
            >
              <span>
                <FontAwesomeIcon icon={uploadedFiles.length > 0 ? faCheck : faUpload} className="icons-end" />
                {uploadedFiles.length > 0 ? `${uploadedFiles.length} ${text.files}` : (text.upFile || text.upload)}
              </span>
              <FontAwesomeIcon icon={faChevronDown} />
            </button>

            {showUploadMenu && (
              <div className="upload-dropdown">
                {/* FILE UPLOAD OPTION */}
                <div>
                  <input
                    type="file"
                    id="file-upload-single"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    multiple
                  />
                  <label htmlFor="file-upload-single" className="upload-option">
                    <FontAwesomeIcon icon={faFile} className="option-icon" />
                    {text.uploadFiles}
                  </label>
                </div>

                {/* FOLDER UPLOAD OPTION */}
                <div>
                  <input
                    type="file"
                    id="file-upload-folder"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    multiple
                    webkitdirectory=""
                    directory=""
                  />
                  <label htmlFor="file-upload-folder" className="upload-option">
                    <FontAwesomeIcon icon={faFolderOpen} className="option-icon" />
                    {text.uploadFolder}
                  </label>
                </div>
              </div>
            )}

          </div>

        </section>

        {uploadedFiles.length > 0 && (
          <div className='analyse-btn'>
            <button onClick={initiateAnalysis} className="btn" disabled={isAnalyzing}>
              {isAnalyzing ? text.analyzing : text.analyzeBtn}
            </button>

            {results.some(r => r.fixedCode) && (
              <button onClick={uploadedFiles.length > 1 ? downloadAllFixed : () => downloadSingleFile(results[0].fixedCode, results[0].fileName)} className="btn">
                {uploadedFiles.length > 1 ? text.downloadZip : text.downloadFixed}
              </button>
            )}
          </div>
        )}

        {results.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            {results.every(r => r.score === 100) && (
              <Confetti
                key={confettiKey}
                width={window.innerWidth}
                height={window.innerHeight}
                recycle={false}
                numberOfPieces={500}
                style={{ position: 'fixed', top: 0, insetInlineStart: 0, zIndex: 9999, pointerEvents: 'none' }}
              />
            )}

            {results.map((res, idx) => (
              <div key={idx} className={`results-section ${getResultClass(res.score)}`} style={{ marginBottom: '20px' }}>
                <h3>{res.fileName} - {text.score} {res.score}/100</h3>

                {Object.entries(
                  res.warnings.reduce((acc, warn) => {
                    const type = warn.type || "Other";
                    if (!acc[type]) acc[type] = [];
                    acc[type].push(warn);
                    return acc;
                  }, {})
                ).map(([type, warnings], groupIdx) => (
                  <div key={groupIdx} className="warning-group">
                    <h4 className="warning-group-title">
                      {type}
                    </h4>
                    <ul className="warning-list">
                      {warnings.map((warn, index) => (
                        <li key={index} className="warning-item">
                          {warn.blogID ? (
                            <Link
                              to={`/blog#post-${warn.blogID}`}
                              className="fix-link"
                            >
                              <span style={{ lineHeight: '1.5' }}>•</span>
                              <span>
                                {warn.msg}
                                <span className="fix-link-text">
                                  {text.howToFix}
                                </span>
                              </span>
                            </Link>
                          ) : (
                            <div className="warning-msg-container">
                              <span style={{ lineHeight: '1.5' }}>•</span>
                              <span>{warn.msg}</span>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {res.warnings.length === 0 && <p>{text.noIssues}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
