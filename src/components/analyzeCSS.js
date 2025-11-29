const analyzeCSS = (cssString, text) => {
  let score = 100;
  let warnings = [];
  let fixedCSS = cssString; // start with the original and modify it

  // --- CHECK SCROLL BEHAVIOR ---
  if (!fixedCSS.includes("scroll-behavior: smooth")) {
    score -= 10;
    warnings.push({
      type: "UX Fix",
      msg: text.fixScroll,
      blogID: 5
    });
    // Auto-fix: Append it to the top of the file
    fixedCSS = "html { scroll-behavior: smooth; }\n" + fixedCSS;
  }

  // --- AUTOMATED RTL FIXES (Replacements) ---

  // Helper to run replace and log it
  const autoFix = (regex, replacement, message, id) => {
    if (fixedCSS.match(regex)) {
      // If we found a match, deduct score and log the fix
      score -= 5;
      warnings.push({
        type: "RTL Auto-Fix",
        msg: message,
        blogID: id
      });
      // Perform the replacement globally ('g')
      fixedCSS = fixedCSS.replace(regex, replacement);
    }
  };

  // Run the Fixers

  // Margins
  autoFix(/margin-left/g, "margin-inline-start", text.fixMarginLeft, 3);
  autoFix(/margin-right/g, "margin-inline-end", text.fixMarginRight, 3);

  // Paddings
  autoFix(/padding-left/g, "padding-inline-start", text.fixPaddingLeft, 3);
  autoFix(/padding-right/g, "padding-inline-end", text.fixPaddingRight, 3);

  // Borders (Physical sides -> Logical sides)
  autoFix(/border-left/g, "border-inline-start", "Replaced border-left with border-inline-start", 3);
  autoFix(/border-right/g, "border-inline-end", "Replaced border-right with border-inline-end", 3);

  // Text Align (Left -> Start, Right -> End)
  // We use regex with specific spacing checks so we don't break other words
  autoFix(/text-align:\s*left/g, "text-align: start", text.fixTextAlign, 8);
  autoFix(/text-align:\s*right/g, "text-align: end", text.fixTextAlign, 8);

  // 1. Specific Corners (Physical -> Logical)
  // This converts "border-top-left-radius" to "border-start-start-radius" so it flips automatically.
  autoFix(/border-top-left-radius/g, "border-start-start-radius", "Fixed top-left radius to logical start-start", 3);
  autoFix(/border-top-right-radius/g, "border-start-end-radius", "Fixed top-right radius to logical start-end", 3);
  autoFix(/border-bottom-right-radius/g, "border-end-end-radius", "Fixed bottom-right radius to logical end-end", 3);
  autoFix(/border-bottom-left-radius/g, "border-end-start-radius", "Fixed bottom-left radius to logical end-start", 3);

  // 2. Shorthand Explosion (The Magic Fix for inputs & buttons)
  // This catches "border-radius: 8px 0 0 8px;" and explodes it into 4 logical lines.
  // We use a callback function as the replacement to capture the 4 values (tl, tr, br, bl).
  autoFix(
    /border-radius:\s*([^\s;]+)\s+([^\s;]+)\s+([^\s;]+)\s+([^\s;]+);/g,
    (match, tl, tr, br, bl) => {
      return `
      border-start-start-radius: ${tl};
      border-start-end-radius: ${tr};
      border-end-end-radius: ${br};
      border-end-start-radius: ${bl};
      `;
    },
    "Converted physical border-radius shorthand to logical properties",
    3
  );


  // PIXEL UNIT CHECK (Smart Version) ---

  // Create a temporary string for analysis
  // We remove the definition line of media queries (e.g., "@media (max-width: 768px) {")
  // So that '768px' doesn't get flagged.
  // Regex explanation: Match "@media", then anything that is NOT a "{", then the "{"
  const codeForPxCheck = fixedCSS.replace(/@media[^{]+\{/g, "");

  // Find matches in the CLEANED string
  const pxMatches = [...codeForPxCheck.matchAll(/(\d*\.?\d+)px/g)];

  // Check values > 10
  const hasLargePixels = pxMatches.some(match => {
    const value = parseFloat(match[1]);
    return value > 10;
  });

  if (hasLargePixels) {
    score -= 5;
    warnings.push({
      type: "Responsiveness",
      msg: text.warnPx,
      blogID: 4
    });
  }

  // Prevent negative score
  score = Math.max(0, score);

  return { score, warnings, fixedCSS };
};

export default analyzeCSS;