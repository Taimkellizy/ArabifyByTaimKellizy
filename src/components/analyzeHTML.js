const analyzeHTML = (htmlString, text) => {
  let score = 100;
  let warnings = [];

  // Turn the string into a "Virtual Document"
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

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

  // Check Images for Alt
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

  // Safety: Don't let score go below 0
  score = Math.max(0, score);

  return { score, warnings };
};

export default analyzeHTML;