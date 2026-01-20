import postcss from 'postcss';
import safeParser from 'postcss-safe-parser';

const analyzeCSS = async (cssString, text) => {
  let score = 100;
  let warnings = [];

  const plugin = {
    postcssPlugin: 'arabify-analyzer',
    Declaration(decl) {
      // --- RTL FIXES ---

      // Margins
      if (decl.prop === 'margin-left') {
        decl.prop = 'margin-inline-start';
        score -= 5;
        warnings.push({ type: text.errtypeRTL, msg: text.fixMarginLeft, blogID: 3 });
      } else if (decl.prop === 'margin-right') {
        decl.prop = 'margin-inline-end';
        score -= 5;
        warnings.push({ type: text.errtypeRTL, msg: text.fixMarginRight, blogID: 3 });
      }

      // Paddings
      else if (decl.prop === 'padding-left') {
        decl.prop = 'padding-inline-start';
        score -= 5;
        warnings.push({ type: text.errtypeRTL, msg: text.fixPaddingLeft, blogID: 3 });
      } else if (decl.prop === 'padding-right') {
        decl.prop = 'padding-inline-end';
        score -= 5;
        warnings.push({ type: text.errtypeRTL, msg: text.fixPaddingRight, blogID: 3 });
      }

      // Borders (Physical -> Logical)
      else if (decl.prop === 'border-left') {
        decl.prop = 'border-inline-start';
        score -= 5;
        warnings.push({ type: text.errtypeRTL, msg: text.fixBorderLeft, blogID: 3 });
      } else if (decl.prop === 'border-right') {
        decl.prop = 'border-inline-end';
        score -= 5;
        warnings.push({ type: text.errtypeRTL, msg: text.fixBorderRight, blogID: 3 });
      }

      // Text Align
      else if (decl.prop === 'text-align') {
        if (decl.value === 'left') {
          decl.value = 'start';
          score -= 5;
          warnings.push({ type: text.errtypeRTL, msg: text.fixTextAlign, blogID: 7 });
        } else if (decl.value === 'right') {
          decl.value = 'end';
          score -= 5;
          warnings.push({ type: text.errtypeRTL, msg: text.fixTextAlign, blogID: 7 });
        }
      }

      // Specific Corners (Physical -> Logical)
      else if (decl.prop === 'border-top-left-radius') {
        decl.prop = 'border-start-start-radius';
        score -= 5;
        warnings.push({ type: text.errtypeRTL, msg: text.fixBorderTopLeftRadius, blogID: 3 });
      } else if (decl.prop === 'border-top-right-radius') {
        decl.prop = 'border-start-end-radius';
        score -= 5;
        warnings.push({ type: text.errtypeRTL, msg: text.fixBorderTopRightRadius, blogID: 3 });
      } else if (decl.prop === 'border-bottom-right-radius') {
        decl.prop = 'border-end-end-radius';
        score -= 5;
        warnings.push({ type: text.errtypeRTL, msg: text.fixBorderBottomRightRadius, blogID: 3 });
      } else if (decl.prop === 'border-bottom-left-radius') {
        decl.prop = 'border-end-start-radius';
        score -= 5;
        warnings.push({ type: text.errtypeRTL, msg: text.fixBorderBottomLeftRadius, blogID: 3 });
      }

      // Shorthand Explosion (border-radius: tl tr br bl)
      else if (decl.prop === 'border-radius') {
        const parts = postcss.list.space(decl.value);
        if (parts.length === 4) {
          const [tl, tr, br, bl] = parts;
          decl.replaceWith(
            { prop: 'border-start-start-radius', value: tl },
            { prop: 'border-start-end-radius', value: tr },
            { prop: 'border-end-end-radius', value: br },
            { prop: 'border-end-start-radius', value: bl }
          );
          score -= 5;
          warnings.push({
            type: text.errtypeRTL,
            msg: text.fixBorderRadiusShorthand,
            blogID: 3
          });
        }
      }

      // Positioning (left/right -> inset-inline-start/end)
      else if (decl.prop === 'left') {
        decl.prop = 'inset-inline-start';
        score -= 5;
        warnings.push({ type: text.errtypeRTL, msg: text.fixLeftPosition, blogID: 3 });
      } else if (decl.prop === 'right') {
        decl.prop = 'inset-inline-end';
        score -= 5;
        warnings.push({ type: text.errtypeRTL, msg: text.fixRightPosition, blogID: 3 });
      }

      // --- PIXEL UNIT CHECK ---
      // Check for pixel values > 10px in any declaration value
      const pxMatches = decl.value.match(/(\d*\.?\d+)px/g);
      if (pxMatches) {
        const hasLargePixels = pxMatches.some(match => parseFloat(match) > 10);
        if (hasLargePixels) {
          // We only want to warn once per file ideally, or maybe per declaration?
          // The previous logic warned once if ANY large pixel was found.
          // Let's check if we already have this warning.
          const alreadyWarned = warnings.some(w => w.type === text.errtypeResponsiveness && w.msg === text.warnPx);
          if (!alreadyWarned) {
            score -= 5;
            warnings.push({ type: text.errtypeResponsiveness, msg: text.warnPx, blogID: 4 });
          }
        }
      }
    }
  };

  const result = await postcss([plugin]).process(cssString, { parser: safeParser, from: 'input.css' });

  // Prevent negative score
  score = Math.max(0, score);

  return { score, warnings, fixedCSS: result.css };
};

export default analyzeCSS;