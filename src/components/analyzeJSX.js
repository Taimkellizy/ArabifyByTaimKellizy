import { parse } from '@babel/parser';

import { injectProvider, injectToggle } from '../utils/reactInjector';

const analyzeJSX = (codeString, text, options = { mode: 'scan', isAppFile: false }) => {
    let score = 100;
    let warnings = [];
    let fixedCode = null;

    let ast;
    try {
        ast = parse(codeString, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript', 'classProperties', 'dynamicImport', 'exportDefaultFrom', 'exportNamespaceFrom', 'modules', 'objectRestSpread']
        });
    } catch (e) {
        // If parsing fails, return a fatal error or just basic score reduction
        console.error("JSX Parse Error:", e);
        return { score: 0, warnings: [{ type: "Syntax Error", msg: text.msgParseError, blogID: 0 }] };
    }

    // Helper to traverse AST
    const traverse = (node, visitor) => {
        if (!node || typeof node !== 'object') return;

        if (visitor[node.type]) {
            visitor[node.type](node);
        }

        for (const key in node) {
            if (key === 'loc' || key === 'start' || key === 'end' || key === 'comments') continue;
            const child = node[key];
            if (Array.isArray(child)) {
                child.forEach(c => traverse(c, visitor));
            } else if (child && typeof child === 'object') {
                traverse(child, visitor);
            }
        }
    };

    // State to track findings
    const foundTags = new Set();


    // Visitor
    const visitor = {
        ObjectExpression: (node) => {
            node.properties.forEach(prop => {
                if (!prop.key) return;
                const keyName = prop.key.name || prop.key.value;

                // 1. Check for Physical Properties (Keys)
                const physicalProps = [
                    'marginLeft', 'marginRight', 'paddingLeft', 'paddingRight',
                    'left', 'right',
                    'borderLeft', 'borderRight', 'borderLeftWidth', 'borderRightWidth',
                    'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'
                ];

                if (physicalProps.includes(keyName)) {
                    score -= 5;
                    warnings.push({ type: text.errtypeRTL, msg: text.msgAvoidPhysicalProp(keyName), blogID: 3 });
                }

                // 2. Check Values (textAlign, float)
                // Handle TSAsExpression (e.g. 'left' as const)
                let valueNode = prop.value;
                if (valueNode && valueNode.type === 'TSAsExpression') {
                    valueNode = valueNode.expression;
                }

                if (keyName === 'textAlign' || keyName === 'text-align') {
                    if (valueNode && (valueNode.value === 'left' || valueNode.value === 'right')) {
                        score -= 5;
                        warnings.push({ type: text.errtypeRTL, msg: text.msgAvoidTextAlign, blogID: 3 });
                    }
                }
                if (keyName === 'float') {
                    if (valueNode && (valueNode.value === 'left' || valueNode.value === 'right')) {
                        score -= 5;
                        warnings.push({ type: text.errtypeRTL, msg: text.msgAvoidFloat, blogID: 3 });
                    }
                }

                // 3. Check borderRadius shorthand (4 values)
                if (keyName === 'borderRadius') {
                    if (valueNode && valueNode.type === 'StringLiteral') {
                        const parts = valueNode.value.trim().split(/\s+/);
                        if (parts.length === 4) { // 4 values are direction sensitive (top-left, top-right, bottom-right, bottom-left)
                            score -= 5;
                            warnings.push({ type: text.errtypeRTL, msg: text.msgAvoidBorderRadiusShorthand, blogID: 3 });
                        }
                    }
                }
            });
        },

        JSXOpeningElement: (node) => {
            const name = getJSXName(node.name);
            foundTags.add(name.toLowerCase());



            // Accessibility: img alt
            if (name === 'img') {
                const altAttr = node.attributes.find(attr => attr.type === 'JSXAttribute' && attr.name.name === 'alt');
                if (!altAttr) {
                    score -= 5;
                    warnings.push({
                        type: text.errtypeAlt,
                        msg: text.msgMissingAlt("?"), // We don't have easy index here, using generic msg
                        blogID: 2
                    });
                }
            }

            // Accessibility: button aria-label
            if (name === 'button') {
                // Check if it has content (children) - this is hard in simple traversal without parent context or full subtree check
                // So we strictly check for aria-label or title if we can't easily check children text
                // For now, let's check if it has 'aria-label' or 'title'
                const hasLabel = node.attributes.some(attr =>
                    attr.type === 'JSXAttribute' && (attr.name.name === 'aria-label' || attr.name.name === 'title')
                );

                // We can't easily check if it has text content without looking at the closing element's parent's children.
                // But we can check if it's self-closing <button /> which is definitely bad if no label
                if (node.selfClosing && !hasLabel) {
                    score -= 5;
                    warnings.push({
                        type: text.errtypeAlt,
                        msg: text.msgEmptyButton,
                        blogID: 2
                    });
                }
            }

            // RTL: className strings
            const classAttr = node.attributes.find(attr => attr.type === 'JSXAttribute' && (attr.name.name === 'className' || attr.name.name === 'class'));
            if (classAttr && classAttr.value) {
                if (classAttr.value.type === 'StringLiteral') {
                    checkClassName(classAttr.value.value, warnings, text);
                } else if (classAttr.value.type === 'JSXExpressionContainer' && classAttr.value.expression.type === 'StringLiteral') {
                    checkClassName(classAttr.value.expression.value, warnings, text);
                }
            }
        }
    };

    traverse(ast, visitor);

    // Safety
    score = Math.max(0, score);

    // Structure Checks
    if (foundTags.has('main') || foundTags.has('body')) {
        if (!foundTags.has('header')) {
            score -= 5;
            warnings.push({ type: text.errtypeStructure, msg: text.msgMissingHeader, blogID: 1 });
        }
        if (!foundTags.has('footer')) {
            score -= 5;
            warnings.push({ type: text.errtypeStructure, msg: text.msgMissingFooter, blogID: 1 });
        }
    }

    // --- MULTI-LANG INJECTION ---
    if (options.mode === 'multi-lang') {
        let injected = false;
        let modifiedCode = codeString; // Start with original

        // 1. Inject Provider if it's the App File
        if (options.isAppFile) {
            modifiedCode = injectProvider(modifiedCode);
            injected = true;
        }

        // 2. Inject Toggle if it has Nav/Header
        if (foundTags.has('nav') || foundTags.has('header')) {
            modifiedCode = injectToggle(modifiedCode);
            injected = true;
        }

        if (injected) {
            fixedCode = modifiedCode;
        }
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

const checkClassName = (className, warnings, text) => {
    if (!className) return;

    // This is a loose check, might match "bright-color" which is false positive.
    // Better to check for word boundaries or specific tailwind classes
    // For now, let's look for "text-left", "text-right", "float-left", "float-right"

    if (/\btext-left\b/.test(className) || /\btext-right\b/.test(className)) {
        // We assume this is covered by general RTL warning or we add a new one
        // For now, let's just use the generic RTL msg
        warnings.push({ type: text.errtypeRTL, msg: text.msgAvoidTextLeftRightClass, blogID: 3 });
    }

    if (/\b(ml-|mr-|pl-|pr-)\d+/.test(className)) {
        warnings.push({ type: text.errtypeRTL, msg: text.msgAvoidPhysicalMarginPaddingClass, blogID: 3 });
    }
};

export default analyzeJSX;
