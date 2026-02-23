import { parse } from '@babel/parser';
import { injectProvider, injectToggle } from './utils/reactInjector.js';
import { 
    STRICT_PHYSICAL_PROPS, 
    AMBIGUOUS_PROPS, 
    STRICT_CSS_PROPS, 
    LOGICAL_PROPS, 
    RTL_MAPPINGS 
} from './constants.js';

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
        const isTS = options.fileName && options.fileName.toLowerCase().endsWith('.ts') && !options.fileName.toLowerCase().endsWith('.tsx');
        
        const plugins = [
            'typescript', 
            'classProperties', 'dynamicImport', 'exportDefaultFrom', 'exportNamespaceFrom', 'modules', 'objectRestSpread'
        ];

        // Only add JSX plugin if NOT a pure .ts file
        if (!isTS) {
            plugins.push('jsx');
        }

        ast = parse(codeString, {
            sourceType: 'module',
            plugins: plugins
        });
    } catch (e) {
        // If parsing fails, return a fatal error or just basic score reduction
        console.error("JSX Parse Error:", e);
        return { score: 0, warnings: [{ type: "errtypeGeneric", code: "PARSE_ERROR", blogID: 0 }] };
    }

    // Helper to traverse AST with Ancestry Tracking
    const traverse = (node, visitor, ancestors = []) => {
        if (!node || typeof node !== 'object') return;

        if (visitor[node.type]) {
            visitor[node.type](node, ancestors);
        }

        for (const key in node) {
            if (key === 'loc' || key === 'start' || key === 'end' || key === 'comments') continue;
            const child = node[key];
            const newAncestors = [...ancestors, node];
            if (Array.isArray(child)) {
                child.forEach(c => traverse(c, visitor, newAncestors));
            } else if (child && typeof child === 'object') {
                traverse(child, visitor, newAncestors);
            }
        }
    };

    // --- CONTEXT-AWARE HELPER ---
    const getStyleContext = (node, ancestors) => {
        const parent = ancestors.length > 0 ? ancestors[ancestors.length - 1] : null;
        if (!parent) return false;

        // 1. Prop Context: style={{ ... }}, sx={{ ... }}, css={{ ... }}
        // Structure: JSXAttribute -> JSXExpressionContainer -> ObjectExpression
        // So parent is JSXExpressionContainer, grandparent is JSXAttribute
        const grandparent = ancestors.length > 1 ? ancestors[ancestors.length - 2] : null;
        
        if (parent.type === 'JSXExpressionContainer' && grandparent && grandparent.type === 'JSXAttribute') {
            const attrName = grandparent.name.name;
            if (['style', 'sx', 'css'].includes(attrName)) return true;
        }

        // 2. Naming Context: const buttonStyle = { ... }
        // Parent of ObjectExpression could be VariableDeclarator
        if (parent.type === 'VariableDeclarator' && parent.id && parent.id.name) {
            const varName = parent.id.name.toLowerCase();
            if (varName.includes('style') || varName.includes('css')) return true;
        }

        // 3. Sibling Context: Contains known CSS properties
        const hasStrictSibling = node.properties.some(p => {
            if (!p.key) return false;
            const k = p.key.name || p.key.value;
            return STRICT_CSS_PROPS.includes(k);
        });
        
        if (hasStrictSibling) return true;

        return false;
    };

    // State to track findings
    const foundTags = new Set();

    // Helper to check Class Names (Moved inside to access score)
    const checkClassName = (className) => {
        if (!className) return;

        // 1. Text alignment classes (left/right)
        if (className.match(/\b(text-left|text-right)\b/)) {
            score -= 5;
            warnings.push({ type: "errtypeRTL", code: "DETECTED_DIRECTIONAL_CLASS_NAME", blogID: 3 });
        }
        
        // 2. Float alignment classes
        if (className.match(/\b(float-left|float-right)\b/)) {
            score -= 5;
            warnings.push({ type: "errtypeRTL", code: "DETECTED_DIRECTIONAL_CLASS_NAME", blogID: 3 });
        }

        // 3. Physical Margin/Padding
        if (/\b(ml-|mr-|pl-|pr-)\d+/.test(className)) {
             // We can keep this as is, or also merge it. The user specifically asked to rename AVOID_TEXT_LEFT_RIGHT_CLASS.
             // But let's assume "DETECTED_DIRECTIONAL_CLASS_NAME" covers directional classes.
             // However, the prompt only explicitly mentioned renaming AVOID_TEXT_LEFT_RIGHT_CLASS.
             // I will leave AVOID_PHYSICAL_MARGIN_PADDING_CLASS as it is distinct, unless requested otherwise.
             // ACTUALLY: "Rename Error Code: Change AVOID_TEXT_LEFT_RIGHT_CLASS to DETECTED_DIRECTIONAL_CLASS_NAME"
             // It didn't say change ALL class warnings.
            warnings.push({ type: "errtypeRTL", code: "AVOID_PHYSICAL_MARGIN_PADDING_CLASS", blogID: 3 });
        }
    };

    // Visitor
    const visitor = {
        ObjectExpression: (node, ancestors) => {
            const isStyle = getStyleContext(node, ancestors);

            node.properties.forEach(prop => {
                if (!prop.key) return;
                const keyName = prop.key.name || prop.key.value;

                // 1. Strict Physical Properties (Always Errors)
                if (STRICT_PHYSICAL_PROPS.includes(keyName)) {
                    // Mapping Heuristic: Ignore if value is a corresponding logical property string
                    let valueStr = '';
                    if (prop.value && prop.value.type === 'StringLiteral') {
                        valueStr = prop.value.value;
                    } else if (prop.value && prop.value.type === 'TSAsExpression' && prop.value.expression.type === 'StringLiteral') {
                        valueStr = prop.value.expression.value;
                    }

                    if (LOGICAL_PROPS.includes(valueStr)) {
                        return; // Ignore mapping objects
                    }

                    score -= 5;
                    warnings.push({ type: "errtypeRTL", code: "AVOID_PHYSICAL_PROP", args: [keyName], blogID: 3 });
                    return; // Done with this prop
                }

                // 2. Ambiguous Properties (left, right) - Context Aware
                if (AMBIGUOUS_PROPS.includes(keyName)) {
                    if (isStyle) {
                        score -= 5;
                        warnings.push({ type: "errtypeRTL", code: "AVOID_PHYSICAL_PROP", args: [keyName], blogID: 3 });
                    }
                    // Else: Ignore (0 points)
                }

                // 3. Check Values (textAlign, float)
                // Handle TSAsExpression (e.g. 'left' as const)
                let valueNode = prop.value;
                if (valueNode && valueNode.type === 'TSAsExpression') {
                    valueNode = valueNode.expression;
                }

                if (keyName === 'textAlign' || keyName === 'text-align') {
                    if (valueNode && (valueNode.value === 'left' || valueNode.value === 'right')) {
                        score -= 5;
                        warnings.push({ type: "errtypeRTL", code: "AVOID_TEXT_ALIGN", blogID: 3 });
                    }
                }
                if (keyName === 'float') {
                    if (valueNode && (valueNode.value === 'left' || valueNode.value === 'right')) {
                        score -= 5;
                        warnings.push({ type: "errtypeRTL", code: "AVOID_FLOAT", blogID: 3 });
                    }
                }

                // 4. Check borderRadius shorthand (4 values)
                if (keyName === 'borderRadius') {
                    if (valueNode && valueNode.type === 'StringLiteral') {
                        const parts = valueNode.value.trim().split(/\s+/);
                        if (parts.length === 4) { // 4 values are direction sensitive (top-left, top-right, bottom-right, bottom-left)
                            score -= 5;
                            warnings.push({ type: "errtypeRTL", code: "AVOID_BORDER_RADIUS_SHORTHAND", blogID: 3 });
                        }
                    }
                }
            });
        },

        JSXOpeningElement: (node) => {
            const name = getJSXName(node.name);
            foundTags.add(name.toLowerCase());



                // Accessibility: img alt
                // Accessibility: img alt moved to analyzeA11Y.js

            // Accessibility: button aria-label moved to analyzeA11Y.js

            // RTL: className strings
            const classAttr = node.attributes.find(attr => attr.type === 'JSXAttribute' && (attr.name.name === 'className' || attr.name.name === 'class'));
            if (classAttr && classAttr.value) {
                if (classAttr.value.type === 'StringLiteral') {
                    checkClassName(classAttr.value.value);
                } else if (classAttr.value.type === 'JSXExpressionContainer' && classAttr.value.expression.type === 'StringLiteral') {
                    checkClassName(classAttr.value.expression.value);
                }
            }
        }
    };

    traverse(ast, visitor, []);

    // Safety
    score = Math.max(0, score);

    // Structure Checks
    if (foundTags.has('main') || foundTags.has('body')) {
        // The instruction snippet adds `&& isAppFile` and removes `score -= 5;`
        // `isAppFile` is `options.isAppFile`.
        if (!foundTags.has('header') && options.isAppFile) {
            warnings.push({ type: "errtypeStructure", code: "MISSING_HEADER", blogID: 1 });
        }
        if (!foundTags.has('footer') && options.isAppFile) {
            warnings.push({ type: "errtypeStructure", code: "MISSING_FOOTER", blogID: 1 });
        }
    }

    // --- MULTI-LANG INJECTION & FIXES ---
    let modifiedCode = codeString;
    let injected = false;
    let styleFixed = false;
    
    // 0. Apply Style Fixes (Replacements)
    // We collect replacements during traversal. BUT we need to be careful.
    // Let's re-traverse or collect during the first pass.
    // To keep it simple and safe, let's collect findings in the main traversal and apply them here IF mode allows.
    
    if (['fix', 'fix-css', 'fix-all', 'multi-lang'].includes(options.mode)) {
        const replacements = [];
        const fixVisitor = {
             ObjectExpression: (node, ancestors) => {
                const isStyle = getStyleContext(node, ancestors);

                node.properties.forEach(prop => {
                    if (!prop.key) return;
                    const keyName = prop.key.name || prop.key.value;
                    const valNode = prop.value;

                    // Helper to push replacement
                    const addReplacement = (start, end, text) => {
                        replacements.push({ start, end, text });
                    };

                    // KEY MAPPINGS
                    // Use RTL_MAPPINGS from constants.js
                    // RTL_MAPPINGS is array of arrays: [['marginLeft', 'marginInlineStart'], ...]
                    
                    const mapping = RTL_MAPPINGS.find(m => m[0] === keyName);
                    
                    if (mapping) {
                        const targetKey = mapping[1];
                        
                        // Strict check: Always replace
                        if (STRICT_PHYSICAL_PROPS.includes(keyName)) {
                             addReplacement(prop.key.start, prop.key.end, targetKey);
                        }
                        // Ambiguous check: Replace only if isStyle
                        else if (AMBIGUOUS_PROPS.includes(keyName) && isStyle) {
                             addReplacement(prop.key.start, prop.key.end, targetKey);
                        }
                    }


                    // VALUE MAPPINGS
                    // Handle literal strings
                    if (valNode && (valNode.type === 'StringLiteral' || valNode.type === 'Literal')) {
                        const val = valNode.value;
                        if (keyName === 'textAlign' || keyName === 'text-align') {
                            if (val === 'left') addReplacement(valNode.start, valNode.end, "'start'");
                            if (val === 'right') addReplacement(valNode.start, valNode.end, "'end'");
                        }
                        if (keyName === 'float') {
                            if (val === 'left') addReplacement(valNode.start, valNode.end, "'inline-start'");
                            if (val === 'right') addReplacement(valNode.start, valNode.end, "'inline-end'");
                        }
                        // Clear/Positioning? (Usually handled by CSS, but good to have)
                    }
                });
             }
        };

        // Run visitor to collect replacements
        traverse(ast, fixVisitor, []);

        if (replacements.length > 0) {
            // Sort Descending to prevent index shift
            replacements.sort((a, b) => b.start - a.start);
            
            // Apply replacements
            replacements.forEach(rep => {
                modifiedCode = modifiedCode.slice(0, rep.start) + rep.text + modifiedCode.slice(rep.end);
            });
            styleFixed = true;
        }
    }


    if (['multi-lang', 'fix-lang', 'fix-all'].includes(options.mode)) {
        // 1. Inject Provider if it's the App File
        if (options.isAppFile) {
            modifiedCode = injectProvider(modifiedCode);
            injected = true;
        }

        // 2. Inject Toggle based on user configuration
        const targetPos = options.config?.languageSwitcher?.position || 'nav';
        let shouldInject = false;
        
        if (targetPos === 'custom selector') {
            shouldInject = true;
        } else if (foundTags.has(targetPos)) {
            shouldInject = true;
        } else if (foundTags.has('nav') || foundTags.has('header')) {
            shouldInject = true;
        }

        if (shouldInject) {
            modifiedCode = injectToggle(modifiedCode, targetPos);
            injected = true;
        }
    }

    if (injected || styleFixed) {
        fixedCode = modifiedCode;
    }

    return { score, warnings, foundTags, fixedCode }; // Return foundTags & fixedCode
};

// Helper to get name from JSXMemberExpression (e.g. Components.Header)
const getJSXName = (node) => {
    if (node.type === 'JSXIdentifier') return node.name;
    if (node.type === 'JSXMemberExpression') {
        return `${getJSXName(node.object)}.${getJSXName(node.property)}`;
    }
    return '';
};

export default analyzeJSX;
