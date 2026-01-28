import { injectVanillaLogic } from '../utils/vanillaInjector';

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
      warnings.push({ type: text.errtypeStructure, msg: text.msgMissingHeader, blogID: 1 });
    }

    if (!doc.querySelector("nav")) {
      score -= 20;
      warnings.push({ type: text.errtypeStructure, msg: text.msgMissingNav, blogID: 1 });
    }

    if (!doc.querySelector("footer")) {
      score -= 20;
      warnings.push({ type: text.errtypeStructure, msg: text.msgMissingFooter, blogID: 1 });
    }
  }

  if (options.isMainFile) {
    // --- META CHECKS (Using DOMParser) ---

    // Check Charset
    if (!doc.querySelector("meta[charset]")) {
      score -= 5;
      warnings.push({ type: text.errtypeMeta, msg: text.msgMissingMetaCharset, blogID: 6 });
    }

    // Check Viewport
    if (!doc.querySelector('meta[name="viewport"]')) {
      score -= 5;
      warnings.push({ type: text.errtypeMeta, msg: text.msgMissingMetaViewport, blogID: 6 });
    }

    // Check Description
    if (!doc.querySelector('meta[name="description"]')) {
      score -= 5;
      warnings.push({ type: text.errtypeMeta, msg: text.msgMissingMetaDescription, blogID: 6 });
    }

    // Check Keywords
    if (!doc.querySelector('meta[name="keywords"]')) {
      score -= 5;
      warnings.push({ type: text.errtypeMeta, msg: text.msgMissingMetaKeywords, blogID: 6 });
    }

    // Check Author
    if (!doc.querySelector('meta[name="author"]')) {
      score -= 5;
      warnings.push({ type: text.errtypeMeta, msg: text.msgMissingMetaAuthor, blogID: 6 });
    }

    // --- LANG ATTRIBUTE CHECK ---

    // This checks the <html lang="..."> attribute specifically
    const htmlTag = doc.documentElement; // This gets the <html> tag
    if (!htmlTag.hasAttribute("lang")) {
      score -= 5;
      warnings.push({ type: text.errtypeLanguage, msg: text.msgMissingLangAttribute, blogID: 5 });
    }

    if (!htmlTag.hasAttribute("dir")) {
      score -= 5;
      warnings.push({ type: text.errtypeLanguage, msg: text.msgMissingDirAttribute, blogID: 5 });
    }
  }

  // Check Images for Alt (Apply to ALL files)
  const images = doc.querySelectorAll("img");
  images.forEach((img, index) => {
    // Check if alt is missing OR empty (alt="") is valid, but missing is bad
    if (!img.hasAttribute("alt")) {
      score -= 5;

      let finalMessage = text.msgMissingAlt(index + 1);

      warnings.push({
        type: text.errtypeAlt,
        msg: finalMessage,
        blogID: 2
      });
    }
  });

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