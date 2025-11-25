import React, { useState } from 'react'; // Import useState
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import './CodeWindow.css';

const CodeWindow = ({ code, fileName, language = "javascript" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="code-window">
      {/* Header */}
      <div className="window-header">
        <div className="filename">{fileName || "code.js"}</div>
      </div>

      {/* Body Wrapper - This controls the height */}
      <div 
        className="window-body-wrapper"
        style={{
          // If expanded, let it grow. If not, cap it at 300px.
          maxHeight: isExpanded ? 'none' : '300px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <SyntaxHighlighter 
          language={language} 
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '20px',
            background: '#1e1e1e',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            minHeight: '200px',
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
            paddingBottom: '50px',
            
            /* ADD THIS: Forces the code to respect the container width */
            maxWidth: '100%', 
            boxSizing: 'border-box'
          }}
          showLineNumbers={true}
          wrapLongLines={true} 
        >
          {code}
        </SyntaxHighlighter>

        {/* The Fade Out Overlay - Only show when collapsed */}
        {!isExpanded && <div className="code-fade-overlay"></div>}
      </div>

      {/* The Toggle Button Bar (Like a VS Code Status Bar) */}
      <button className="code-footer-btn" onClick={toggleExpand}>
        <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} /> 
        {isExpanded ? " Collapse Code" : " Show All Code"}
      </button>
    </div>
  );
};

export default CodeWindow;