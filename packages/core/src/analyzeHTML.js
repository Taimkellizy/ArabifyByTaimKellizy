import { injectVanillaLogic } from './utils/vanillaInjector.js';

/**
 * Analyzes HTML code for structure, accessibility, SEO, and required attributes.
 * @param {string} htmlString - The HTML code to analyze.
 * @param {object} text - The localization object.
 * @param {object} options - Configuration options.
 * @param {boolean} [options.isMainFile=true] - Whether this is the main entry file (index.html).
 * @param {boolean} [options.checkStructure=false] - Whether to enforce strict structure based on file type.
 * @param {string} [options.mode='scan'] - Analysis mode ('scan', 'fix', 'multi-lang').
 * @returns {object} Result object containing score, warnings, foundTags, and fixedCode.
 */
const analyzeHTML = (htmlString, text, options = { isMainFile: true, checkStructure: false, mode: 'scan' }) => {
  let score = 100;
  let warnings = [];
  let fixedCode = null;

  // Turn the string into a "Virtual Document"
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  // Collect found semantic tags
  const foundTags = new Set();
  ['header', 'nav', 'main', 'footer'].forEach(tag => {
    if (doc.querySelector(tag)) foundTags.add(tag);
  });

  // Structure Checks (Run if Main File OR explicitly requested for local checks)
  // Skip strict structure checks for React projects (index.html is usually just a shell)
  if ((options.isMainFile || options.checkStructure) && !options.isReact) {
    // Check for Semantic Tags
    if (!doc.querySelector("header")) {
      score -= 20;
      warnings.push({ type: "errtypeStructure", code: "MISSING_HEADER", blogID: 1 });
    }

    if (!doc.querySelector("nav")) {
      score -= 20;
      warnings.push({ type: "errtypeStructure", code: "MISSING_NAV", blogID: 1 });
    }

    if (!doc.querySelector("footer")) {
      score -= 20;
      warnings.push({ type: "errtypeStructure", code: "MISSING_FOOTER", blogID: 1 });
    }
  }

  if (options.isMainFile) {
    // --- META CHECKS (Using DOMParser) ---

    // Check Charset
    if (!doc.querySelector("meta[charset]")) {
      score -= 5;
      warnings.push({ type: "errtypeMeta", code: "MISSING_META_CHARSET", blogID: 6 });
    }

    // Check Viewport
    if (!doc.querySelector('meta[name="viewport"]')) {
      score -= 5;
      warnings.push({ type: "errtypeMeta", code: "MISSING_META_VIEWPORT", blogID: 6 });
    }

    // Check Description
    if (!doc.querySelector('meta[name="description"]')) {
      score -= 5;
      warnings.push({ type: "errtypeMeta", code: "MISSING_META_DESCRIPTION", blogID: 6 });
    }

    // Check Keywords
    if (!doc.querySelector('meta[name="keywords"]')) {
      score -= 5;
      warnings.push({ type: "errtypeMeta", code: "MISSING_META_KEYWORDS", blogID: 6 });
    }

    // Check Author
    if (!doc.querySelector('meta[name="author"]')) {
      score -= 5;
      warnings.push({ type: "errtypeMeta", code: "MISSING_META_AUTHOR", blogID: 6 });
    }

    // --- LANG ATTRIBUTE CHECK ---

    // This checks the <html lang="..."> attribute specifically
    if (!doc.documentElement.getAttribute("lang")) {
      score -= 5;
      warnings.push({ type: "errtypeLanguage", code: "MISSING_LANG_ATTRIBUTE", blogID: 5 });
    }

    if (!doc.documentElement.getAttribute("dir")) {
      score -= 5;
      warnings.push({ type: "errtypeLanguage", code: "MISSING_DIR_ATTRIBUTE", blogID: 5 });
    }
  }

  // Check Images for Alt moved to analyzeA11Y.js

  // --- MULTI-LANG INJECTION (If mode is multi-lang AND is main file) ---
  if (options.mode === 'multi-lang' && options.isMainFile) {
     fixedCode = injectVanillaLogic(htmlString);
     // Note: We don't change the score, we just provide the "fix"
  }

  // Safety: Don't let score go below 0
  score = Math.max(0, score);

  return { score, warnings, foundTags, fixedCode };
};

export default analyzeHTML;
