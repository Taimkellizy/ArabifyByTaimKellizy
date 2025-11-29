import React, { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import './CodeWindow.css';

const CodeWindow = ({ code, fileName, language = "javascript" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Ref to measure the inner content
  const contentRef = useRef(null);

  const MAX_HEIGHT = 300; // Define your threshold

  useEffect(() => {
    // Check height whenever code changes
    if (contentRef.current) {
      // scrollHeight is the full height of the content
      if (contentRef.current.scrollHeight > MAX_HEIGHT) {
        setIsOverflowing(true);
      } else {
        setIsOverflowing(false);
      }
    }
  }, [code]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="code-window">
      <div className="window-header">
        <div className="filename">{fileName || "code.js"}</div>
        <button
          className={`copy-btn ${isCopied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="Copy code"
        >
          <FontAwesomeIcon icon={isCopied ? faCheck : faCopy} />
          <span>{isCopied ? "Copied!" : "Copy"}</span>
        </button>
      </div>

      <div
        className="window-body-wrapper"
        // Bind the ref here to measure this div
        ref={contentRef}
        style={{
          // Only limit height if it is actually overflowing AND not expanded
          maxHeight: (isExpanded || !isOverflowing) ? 'none' : `${MAX_HEIGHT}px`,
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
            minHeight: '100px', // Lower min-height for small snippets
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
            paddingBottom: isOverflowing && !isExpanded ? '50px' : '20px',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
          showLineNumbers={true}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>

        {/* Show overlay ONLY if it's overflowing AND currently collapsed */}
        {isOverflowing && !isExpanded && <div className="code-fade-overlay"></div>}
      </div>

      {/* Show button ONLY if it's overflowing */}
      {isOverflowing && (
        <button className="code-footer-btn" onClick={toggleExpand}>
          <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
          {isExpanded ? " Collapse Code" : " Show All Code"}
        </button>
      )}
    </div>
  );
};

export default CodeWindow;