import postcss from 'postcss';
import safeParser from 'postcss-safe-parser';

/**
 * Analyzes CSS code for RTL compatibility, responsiveness, and best practices.
 * @param {string} cssString - The CSS code to analyze.
 * @param {object} text - The localization object containing error messages and labels.
 * @param {object} options - Options like isMainFile.
 * @returns {Promise<object>} Result object containing score, warnings, and fixedCSS.
 */
const analyzeCSS = async (cssString, text, options = {}) => {
  let score = 100;
  let warnings = [];

  const plugin = {
    postcssPlugin: 'arabify-analyzer',
    Declaration(decl) {
      // --- RTL FIXES ---

      // 1. Text Align
      if (decl.prop === 'text-align') {
        if (decl.value === 'left' || decl.value === 'right') {
          score -= 5;
          // Different code/severity could be used here if needed, but for now using FIX_TEXT_ALIGN
          // Note: If isMainFile is true, we might auto-fix (modify decl.value).
          // For the analyzer report, we just flag it.
          // If we want to support auto-fix behavior visible in the "Fixed Code" window:
          if (options.isMainFile) {
             decl.value = decl.value === 'left' ? 'start' : 'end';
          }
          
          warnings.push({ 
            type: "errtypeRTL", 
            code: "FIX_TEXT_ALIGN", 
            blogID: 7 
          });
        }
      }

      // 2. Float
      else if (decl.prop === 'float') {
        if (decl.value === 'left' || decl.value === 'right') {
          score -= 5;
          if (options.isMainFile) {
            decl.value = decl.value === 'left' ? 'inline-start' : 'inline-end';
          }
          warnings.push({ 
            type: "errtypeRTL", 
            code: "FIX_FLOAT", 
            blogID: 7 
          });
        }
      }

      // 3. Physical Properties (Margins, Paddings, Borders, Position)
      const physicalMap = {
        'margin-left': { logical: 'margin-inline-start', code: 'FIX_MARGIN_LEFT' },
        'margin-right': { logical: 'margin-inline-end', code: 'FIX_MARGIN_RIGHT' },
        'padding-left': { logical: 'padding-inline-start', code: 'FIX_PADDING_LEFT' },
        'padding-right': { logical: 'padding-inline-end', code: 'FIX_PADDING_RIGHT' },
        'border-left': { logical: 'border-inline-start', code: 'FIX_BORDER_LEFT' },
        'border-right': { logical: 'border-inline-end', code: 'FIX_BORDER_RIGHT' },
        'left': { logical: 'inset-inline-start', code: 'FIX_LEFT_POSITION' },
        'right': { logical: 'inset-inline-end', code: 'FIX_RIGHT_POSITION' },
        'border-top-left-radius': { logical: 'border-start-start-radius', code: 'FIX_BORDER_TOP_LEFT_RADIUS' },
        'border-top-right-radius': { logical: 'border-start-end-radius', code: 'FIX_BORDER_TOP_RIGHT_RADIUS' },
        'border-bottom-right-radius': { logical: 'border-end-end-radius', code: 'FIX_BORDER_BOTTOM_RIGHT_RADIUS' },
        'border-bottom-left-radius': { logical: 'border-end-start-radius', code: 'FIX_BORDER_BOTTOM_LEFT_RADIUS' },
      };

      if (physicalMap[decl.prop]) {
        score -= 5;
        const entry = physicalMap[decl.prop];
        if (options.isMainFile) {
          decl.prop = entry.logical;
        }
        warnings.push({ 
          type: "errtypeRTL", 
          code: entry.code, 
          blogID: 3 
        });
      }

      // 4. Border Radius Shorthand (4 values)
      else if (decl.prop === 'border-radius') {
        const parts = postcss.list.space(decl.value);
        if (parts.length === 4) {
          score -= 5;
          if (options.isMainFile) {
            const [tl, tr, br, bl] = parts;
            decl.replaceWith(
              { prop: 'border-start-start-radius', value: tl },
              { prop: 'border-start-end-radius', value: tr },
              { prop: 'border-end-end-radius', value: br },
              { prop: 'border-end-start-radius', value: bl }
            );
          }
          warnings.push({
            type: "errtypeRTL",
            code: "FIX_BORDER_RADIUS_SHORTHAND",
            blogID: 3
          });
        }
      }

      // 5. Margin/Padding Shorthand (4 values)
      else if (decl.prop === 'padding' || decl.prop === 'margin') {
        const parts = postcss.list.space(decl.value);
        if (parts.length === 4) {
          score -= 5;
          if (options.isMainFile) {
            const [top, right, bottom, left] = parts;
            decl.replaceWith(
              { prop: `${decl.prop}-block-start`, value: top },
              { prop: `${decl.prop}-inline-end`, value: right },
              { prop: `${decl.prop}-block-end`, value: bottom },
              { prop: `${decl.prop}-inline-start`, value: left }
            );
          }
          warnings.push({
            type: "errtypeRTL",
            code: `FIX_${decl.prop.toUpperCase()}_SHORTHAND`,
            blogID: 3
          });
        }
      }

// Pixel check moved to analyzeA11Y.js

    }
  };

  const result = await postcss([plugin]).process(cssString, { parser: safeParser, from: 'input.css' });

  // Prevent negative score
  score = Math.max(0, score);

  return { score, warnings, fixedCSS: result.css };
};

export default analyzeCSS;
