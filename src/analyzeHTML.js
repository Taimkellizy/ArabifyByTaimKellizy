const analyzeHTML = (htmlString, text) => {
  let score = 100;
  let warnings = [];

  // Turn the string into a "Virtual Document"
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  // Check for Semantic Tags
  if (!doc.querySelector("header")) {
    score -= 20;
    warnings.push({ type: text.errtypeStructure, msg: text.msgMissingHeader });
  }
  
  if (!doc.querySelector("nav")) {
    score -= 20;
    warnings.push({ type: text.errtypeStructure, msg: text.msgMissingNav });
  }

  if (!doc.querySelector("footer")) {
    score -= 20;
    warnings.push({ type: text.errtypeStructure, msg: text.msgMissingFooter });
  }

  // --- META CHECKS (Using DOMParser) ---

  // Check Charset
  if (!doc.querySelector("meta[charset]")) {
    score -= 5;
    warnings.push({ type: text.errtypeMeta, msg: text.msgMissingMetaCharset });
  }

  // Check Viewport
  if (!doc.querySelector('meta[name="viewport"]')) {
    score -= 5;
    warnings.push({ type: text.errtypeMeta, msg: text.msgMissingMetaViewport });
  }

  // Check Description
  if (!doc.querySelector('meta[name="description"]')) {
    score -= 5;
    warnings.push({ type: text.errtypeMeta, msg: text.msgMissingMetaDescription });
  }

  // Check Keywords
  if (!doc.querySelector('meta[name="keywords"]')) {
    score -= 5;
    warnings.push({ type: text.errtypeMeta, msg: text.msgMissingMetaKeywords });
  }

  // Check Author
  if (!doc.querySelector('meta[name="author"]')) {
    score -= 5;
    warnings.push({ type: text.errtypeMeta, msg: text.msgMissingMetaAuthor });
  }

  // --- LANG ATTRIBUTE CHECK ---
  
  // This checks the <html lang="..."> attribute specifically
  const htmlTag = doc.documentElement; // This gets the <html> tag
  if (!htmlTag.hasAttribute("lang")) {
    score -= 5;
    warnings.push({ type: text.errtypeLanguage, msg: text.msgMissingLangAttribute });
  }

  // Check Images for Alt
  const images = doc.querySelectorAll("img");
  images.forEach((img, index) => {
    // Check if alt is missing OR empty (alt="") is valid, but missing is bad
    if (!img.hasAttribute("alt")) {
      score -= 10;
      
      let rawMessage = text.msgMissingAlt;
      let finalMessage = rawMessage.replace("{id}", index + 1);
      
      warnings.push({
        type: text.errtypeAlt,
        msg: finalMessage
      });
    }
  });

  // Safety: Don't let score go below 0
  score = Math.max(0, score);

  return { score, warnings };
};

export default analyzeHTML;