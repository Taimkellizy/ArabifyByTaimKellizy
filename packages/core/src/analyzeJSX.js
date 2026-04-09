import _generate from '@babel/generator';

import { parseCode } from './analyzers/jsx/parse.js';
import { traverseAST } from './analyzers/jsx/traverse.js';
import { detectRTLVisitor } from './analyzers/jsx/detectRTL.js';
import { detectA11yVisitor } from './analyzers/jsx/detectA11y.js';
import { fixStylesVisitor } from './analyzers/jsx/fixStyles.js';
import { handleInjections } from './analyzers/jsx/injectLang.js';
import { applyPenalty } from './analyzers/jsx/scoring.js';

const generate = _generate.default || _generate;

/**
 * Analyzes JSX/React code for inline styles, semantic structure, and accessibility.
 * Handles AST modifications for auto-fixing physical properties and injecting LanguageContext.
 * @param {string} codeString - The JSX code to analyze.
 * @param {object} text - The localization object.
 * @param {object} options - Configuration options.
 * @param {string} [options.mode='scan'] - Analysis mode ('scan', 'fix', 'multi-lang').
 * @param {boolean} [options.isAppFile=false] - Whether this is the main App component.
 * @returns {object} Result object containing score, warnings, foundTags, and fixedCode.
 */
const analyzeJSX = (codeString, text, options = { mode: 'scan', isAppFile: false, fileName: '' }) => {
    let score = 100;
    let warnings = [];
    let fixedCode = null;
    let ast;
    
    try {
        ast = parseCode(codeString, options.fileName);
    } catch (e) {
        console.error("JSX Parse Error:", e);
        warnings.push({ type: "errtypeGeneric", code: "PARSE_ERROR", blogID: 0 });
        score = applyPenalty("PARSE_ERROR", score);
        return { score, warnings, foundTags: new Set() };
    }

    const foundTags = new Set();
    const addWarning = (type, code, blogID, args = []) => {
        warnings.push({ type, code, blogID, args });
        score = applyPenalty(code, score);
    };

    // 1. Detection Phase (Scan mode)
    const rtlVisitor = detectRTLVisitor(addWarning, foundTags);
    const a11yVisitor = detectA11yVisitor(addWarning, foundTags);
    
    const combinedScanVisitor = {
        ObjectExpression(path) {
            if (rtlVisitor.ObjectExpression) rtlVisitor.ObjectExpression(path);
            if (a11yVisitor.ObjectExpression) a11yVisitor.ObjectExpression(path);
        },
        JSXOpeningElement(path) {
            if (rtlVisitor.JSXOpeningElement) rtlVisitor.JSXOpeningElement(path);
            if (a11yVisitor.JSXOpeningElement) a11yVisitor.JSXOpeningElement(path);
        }
    };

    traverseAST(ast, combinedScanVisitor);

    // Structure Checks
    if (foundTags.has('main') || foundTags.has('body')) {
        if (!foundTags.has('header') && options.isAppFile) {
            addWarning("errtypeStructure", "MISSING_HEADER", 1);
        }
        if (!foundTags.has('footer') && options.isAppFile) {
            addWarning("errtypeStructure", "MISSING_FOOTER", 1);
        }
    }

    score = Math.max(0, score);

    // 2. Fix Phase (AST Mutation)
    let styleFixed = false;
    if (['fix', 'fix-css', 'fix-all', 'multi-lang'].includes(options.mode)) {
        traverseAST(ast, fixStylesVisitor());
        styleFixed = true; 
    }

    // Generate intermediate code from fixed AST using @babel/generator 
    let modifiedCode = codeString;
    if (styleFixed) {
        const output = generate(ast, {
            retainLines: true, // Keep original formatting
            compact: false
        }, codeString);
        modifiedCode = output.code;
    }

    // 3. Injection Phase
    const injectionResult = handleInjections(modifiedCode, foundTags, options);
    
    if (injectionResult.injected || styleFixed) {
        fixedCode = injectionResult.modifiedCode;
    }

    return { score, warnings, foundTags, fixedCode };
};

export default analyzeJSX;
