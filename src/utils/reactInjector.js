import { parse } from '@babel/parser';

// Helper to manually traverse AST since we might not have @babel/traverse
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

const detectIndentation = (code) => {
    const lines = code.split('\n');
    for (const line of lines) {
        // Find first line with indentation at start
        // We ignore lines that start with * (comments) or are empty
        if (!line.trim() || line.trim().startsWith('*') || line.trim().startsWith('//')) continue;
        
        const match = line.match(/^(\s+)\S/);
        if (match) {
            const indent = match[1];
            // If it's a multiple of 4, prefer 4. If multiple of 2 but not 4, prefer 2.
            // But usually we just want to know the *unit*.
            // Simple heuristic: check if 2 spaces or 4 spaces are used.
            if (indent.includes('\t')) return '\t';
            if (indent.length % 4 === 0 && indent.length > 0) return '    ';
            if (indent.length % 2 === 0 && indent.length > 0) return '  ';
        }
    }
    return '  '; // Default to 2 spaces
};

export const injectProvider = (code) => {
    // 1. Check if already injected (using AST check)
    let ast;
    try {
        ast = parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript', 'classProperties', 'dynamicImport', 'exportDefaultFrom', 'exportNamespaceFrom']
        });
    } catch (e) {
        console.error("Parse Error in injectProvider:", e);
        return code;
    }

    let lastImportEnd = 0;
    let foundImport = false;
    let returnStatement = null;
    let jsxRoot = null;
    let alreadyInjected = false;

    traverse(ast, {
        ImportDeclaration: (node) => {
            foundImport = true;
            if (node.end > lastImportEnd) lastImportEnd = node.end;
            if (node.source.value.includes('LanguageContext')) {
                alreadyInjected = true;
            }
        },
        JSXOpeningElement: (node) => {
            if (node.name.name === 'LanguageProvider') {
                alreadyInjected = true;
            }
        },
        ReturnStatement: (node) => {
            if (node.argument && (node.argument.type === 'JSXElement' || node.argument.type === 'JSXFragment')) {
                returnStatement = node;
                jsxRoot = node.argument;
            } else if (node.argument && node.argument.type === 'ParenthesizedExpression' && 
                      (node.argument.expression.type === 'JSXElement' || node.argument.expression.type === 'JSXFragment')) {
                returnStatement = node;
                jsxRoot = node.argument.expression;
            }
        }
    });

    if (alreadyInjected) return code;
    if (!jsxRoot) return code;

    // --- EXECUTE INJECTION ---
    
    // 1. Inject Import
    let injectedImport = "import { LanguageProvider } from './contexts/LanguageContext';\n";
    let newCode = code;
    
    if (foundImport) {
        // Insert after last import
        newCode = newCode.slice(0, lastImportEnd) + '\n' + injectedImport + newCode.slice(lastImportEnd);
    } else {
        // Insert at top
        newCode = injectedImport + newCode;
    }

    // Recalculate offset for wrapper injection
    const offset = newCode.length - code.length;
    
    // 2. Inject Wrapper
    const start = jsxRoot.start + offset;
    const end = jsxRoot.end + offset;
    
    const step = detectIndentation(code);
    
    // Detect Base Indentation from the line where JSX starts
    const codeBefore = newCode.slice(0, start);
    const lastNewLine = codeBefore.lastIndexOf('\n');
    let baseIndent = '';
    if (lastNewLine !== -1) {
        const lastLineStr = codeBefore.slice(lastNewLine + 1);
        const match = lastLineStr.match(/^\s*/);
        baseIndent = match ? match[0] : '';
    }
    
    const originalJSX = newCode.slice(start, end);
    const indentedJSX = originalJSX.replace(/\n/g, `\n${step}`);
    
    const wrappedJSX = `<LanguageProvider>\n${baseIndent}${step}${indentedJSX}\n${baseIndent}</LanguageProvider>`;
    
    newCode = newCode.slice(0, start) + wrappedJSX + newCode.slice(end);

    return newCode;
};

export const injectToggle = (code) => {
    let ast;
    try {
        ast = parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript', 'classProperties', 'dynamicImport', 'exportDefaultFrom', 'exportNamespaceFrom']
        });
    } catch (e) {
        console.error("Parse Error in injectToggle:", e);
        return code;
    }

    let lastImportEnd = 0;
    let foundImport = false;
    let targetNode = null; // Nav Element
    let targetList = null; // UL or OL inside Nav
    let alreadyInjected = false;

    traverse(ast, {
        ImportDeclaration: (node) => {
            foundImport = true;
            if (node.end > lastImportEnd) lastImportEnd = node.end;
            if (node.source.value.includes('LanguageToggle')) {
                alreadyInjected = true;
            }
        },
        JSXElement: (node) => {
            const name = node.openingElement.name.name;
            if (name === 'nav') {
                targetNode = node;
                // Look for ul/ol in children
                node.children.forEach(child => {
                    if (child.type === 'JSXElement' && (child.openingElement.name.name === 'ul' || child.openingElement.name.name === 'ol')) {
                        targetList = child;
                    }
                });
            }
            if (name === 'LanguageToggle') {
                alreadyInjected = true;
            }
        }
    });

    if (alreadyInjected) return code;
    
    // Prioritize List inside Nav, then Nav itself. Ignore Header to avoid duplicate injection in App.js.
    const insertionNode = targetList || targetNode;
    if (!insertionNode) return code;

    // --- EXECUTE INJECTION ---

    // 1. Inject Import
    let injectedImport = "import LanguageToggle from './components/LanguageToggle';\n";
    let newCode = code;

    if (foundImport) {
        newCode = newCode.slice(0, lastImportEnd) + '\n' + injectedImport + newCode.slice(lastImportEnd);
    } else {
        newCode = injectedImport + newCode;
    }

    const offset = newCode.length - code.length;

    // 2. Inject Toggle Button
    if (insertionNode.closingElement) {
        const insertPos = insertionNode.closingElement.start + offset;
        
        // Detect indentation of the closing tag line
        const codeBeforeClose = newCode.slice(0, insertPos);
        const lastNewLine = codeBeforeClose.lastIndexOf('\n');
        let indent = '';
        if (lastNewLine !== -1) {
            const lastLineStr = codeBeforeClose.slice(lastNewLine + 1);
            const match = lastLineStr.match(/^\s*/);
            indent = match ? match[0] : '';
        }
        
        const step = detectIndentation(code);
        
        let toggleCode;
        if (targetList) {
            // If inside list, wrap in <li>
            toggleCode = `${step}<li><LanguageToggle /></li>\n${indent}`;
        } else {
            // Fallback for raw nav
            toggleCode = `${step}<LanguageToggle />\n${indent}`;
        }
        
        newCode = newCode.slice(0, insertPos) + toggleCode + newCode.slice(insertPos);
    }

    return newCode;
};
