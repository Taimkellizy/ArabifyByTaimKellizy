import * as t from '@babel/types';
import _traverse from '@babel/traverse';
import generatorModule from '@babel/generator';

const traverse = _traverse.default || _traverse;
const generate = generatorModule.default?.generate || generatorModule.generate;

/**
 * Analyzes AST to find the export default wrapper position.
 * @param {import('@babel/parser').ParseResult} ast - The parsed AST
 * @returns {Object} Export default information
 */
export const analyzeExportDefault = (ast) => {
    let exportDefaultNode = null;
    let exportName = "App";
    
    traverse(ast, {
        ExportDefaultDeclaration(path) {
            exportDefaultNode = path.node;
            if (t.isIdentifier(path.node.declaration)) {
                exportName = path.node.declaration.name;
            } else if (t.isFunctionDeclaration(path.node.declaration) || t.isClassDeclaration(path.node.declaration)) {
                if (path.node.declaration.id) {
                    exportName = path.node.declaration.id.name;
                }
            }
        }
    });
    
    if (!exportDefaultNode) return null;
    
    return {
        node: exportDefaultNode,
        start: exportDefaultNode.start,
        end: exportDefaultNode.end,
        exportName
    };
};

/**
 * Generates the provider wrapper edit using string replacement.
 * @param {string} source - The source code
 * @param {Object} exportInfo - Export default information
 * @returns {Object} Edit details
 */
export const generateProviderWrapperEdit = (source, exportInfo) => {
    if (!exportInfo || !exportInfo.start || !exportInfo.end) return null;
    
    const { exportName, start, end } = exportInfo;
    const wrappedCode = `const ${exportName}WithLang = (props) => (
  <LanguageProvider>
    <${exportName} {...props} />
  </LanguageProvider>
);\nexport default ${exportName}WithLang;`;
    
    return {
        start,
        end,
        replacement: wrappedCode
    };
};

/**
 * Analyzes AST to find toggle injection target.
 * @param {import('@babel/parser').ParseResult} ast - The parsed AST
 * @param {Object} targetConfig - Target configuration
 * @returns {Object} Target element information
 */
export const analyzeToggleTarget = (ast, targetConfig = { tag: "nav" }) => {
    let exactMatch = null;
    let fallback = null;
    let alreadyInjected = false;
    
    const config = typeof targetConfig === 'string' 
        ? { tag: targetConfig, insertMode: "append" } 
        : { tag: "nav", insertMode: "append", ...targetConfig };
    
    traverse(ast, {
        JSXElement(path) {
            const name = path.node.openingElement.name?.name;
            if (!name) return;
            
            if (name === "LanguageToggle") {
                alreadyInjected = true;
            }
            
            if (!exactMatch) {
                let matched = false;
                if (config.id) {
                    const hasTargetId = path.node.openingElement.attributes.some(attr => {
                        return t.isJSXAttribute(attr) &&
                               attr.name.name === 'id' &&
                               t.isStringLiteral(attr.value) &&
                               attr.value.value === config.id;
                    });
                    if (hasTargetId) matched = true;
                } else if (name === config.tag) {
                    matched = true;
                }
                
                if (matched) exactMatch = path;
            }
            
            if (!exactMatch && (name === "nav" || name === "header" || name === "footer")) {
                if (!fallback) fallback = path;
            }
        }
    });
    
    if (alreadyInjected) return { alreadyInjected: true };
    
    let targetPath = exactMatch || fallback;
    
    if (config.floating) {
        traverse(ast, {
            ReturnStatement(path) {
                if (t.isJSXElement(path.node.argument) || t.isJSXFragment(path.node.argument)) {
                    targetPath = path;
                    path.stop();
                }
            }
        });
    }
    
    if (!targetPath || !targetPath.node) return null;
    
    const targetNode = targetPath.node;
    const children = targetNode.children || [];
    
    let insertIndex = children.length;
    if (config.insertMode === 'prepend') {
        insertIndex = 0;
    }
    
    return {
        targetNode,
        targetStart: targetNode.start,
        targetEnd: targetNode.end,
        children,
        insertIndex,
        insertMode: config.insertMode,
        isList: ['ul', 'ol'].includes(targetNode.openingElement?.name?.name),
        alreadyInjected: false
    };
};

/**
 * Generates toggle insertion edit using string insertion.
 * @param {string} source - The source code
 * @param {Object} targetInfo - Target element information
 * @returns {Object} Edit details
 */
export const generateToggleInsertEdit = (source, targetInfo) => {
    if (!targetInfo || targetInfo.alreadyInjected || !targetInfo.targetStart || !targetInfo.targetEnd) {
        return null;
    }
    
    const { targetStart, targetEnd, children, insertMode, isList } = targetInfo;
    
    const toggleCode = '<LanguageToggle />';
    let insertionCode;
    
    if (isList) {
        insertionCode = `<li>${toggleCode}</li>`;
    } else {
        insertionCode = toggleCode;
    }
    
    if (children.length > 0) {
        let firstNonEmptyChild = null;
        let lastRealChild = null;
        
        for (const child of children) {
            if (!t.isJSXText(child) || child.value.trim() !== '') {
                firstNonEmptyChild = firstNonEmptyChild || child;
                lastRealChild = child;
            }
        }
        
        if (firstNonEmptyChild && lastRealChild) {
            if (insertMode === 'prepend') {
                return {
                    start: firstNonEmptyChild.start,
                    end: firstNonEmptyChild.start,
                    replacement: insertionCode + '\n  '
                };
            } else {
                return {
                    start: lastRealChild.end,
                    end: lastRealChild.end,
                    replacement: '\n  ' + insertionCode + '\n'
                };
            }
        }
    }
    
    return {
        start: targetStart + 1,
        end: targetStart + 1,
        replacement: insertionCode + '\n  '
    };
};

export const wrapExportWithProvider = (ast, exportDefaultPath, exportName) => {
    // Kept for backward compatibility - actual wrapping done via string edits
};

export const injectToggleNode = (ast, targetConfig) => {
    // Kept for backward compatibility - actual injection done via string edits
    const targetInfo = analyzeToggleTarget(ast, targetConfig);
    return targetInfo && !targetInfo.alreadyInjected && !!targetInfo.targetNode;
};