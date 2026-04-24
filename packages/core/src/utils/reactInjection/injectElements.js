import * as t from '@babel/types';
import _traverse from '@babel/traverse';

const traverse = _traverse.default || _traverse;

export const wrapExportWithProvider = (ast, exportDefaultPath, exportName) => {
    const propsId = t.identifier('props');
    const wrapperJSX = t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('LanguageProvider'), []),
        t.jsxClosingElement(t.jsxIdentifier('LanguageProvider')),
        [
            t.jsxElement(
                t.jsxOpeningElement(t.jsxIdentifier(exportName), [t.jsxSpreadAttribute(propsId)], true),
                null,
                [],
                true
            )
        ]
    );

    const wrapperFunc = t.variableDeclaration('const', [
        t.variableDeclarator(
            t.identifier(`${exportName}WithLang`),
            t.arrowFunctionExpression([propsId], wrapperJSX)
        )
    ]);

    if (t.isIdentifier(exportDefaultPath.node.declaration)) {
        exportDefaultPath.insertBefore(wrapperFunc);
        exportDefaultPath.node.declaration.name = `${exportName}WithLang`;
    } else if (t.isFunctionDeclaration(exportDefaultPath.node.declaration) || t.isClassDeclaration(exportDefaultPath.node.declaration)) {
        exportDefaultPath.insertBefore(exportDefaultPath.node.declaration);
        exportDefaultPath.insertBefore(wrapperFunc);
        exportDefaultPath.replaceWith(t.exportDefaultDeclaration(t.identifier(`${exportName}WithLang`)));
    }
};

export const injectToggleNode = (ast, targetConfig) => {
    let exactMatchPath = null;
    let fallbackPath = null;
    let alreadyInjected = false;

    // Normalize config
    const config = typeof targetConfig === 'string' 
        ? { tag: targetConfig, insertMode: "append" } 
        : { tag: "nav", insertMode: "append", ...targetConfig };

    traverse(ast, {
        JSXElement(path) {
            const name = path.node.openingElement.name && path.node.openingElement.name.name;
            if (!name) return;
            
            if (name === "LanguageToggle") {
                alreadyInjected = true;
            }

            if (!exactMatchPath) {
                let matched = false;
                if (config.id) {
                    const hasTargetId = path.node.openingElement.attributes.some(attr => {
                        return t.isJSXAttribute(attr) &&
                               attr.name.name === 'id' &&
                               t.isStringLiteral(attr.value) &&
                               attr.value.value === config.id;
                    });
                    if (hasTargetId) {
                        matched = true;
                    }
                } else if (name === config.tag) {
                    matched = true;
                }
                
                if (matched) {
                    exactMatchPath = path;
                }
            }

            if (!exactMatchPath && (name === "nav" || name === "header" || name === "footer")) {
                if (!fallbackPath) fallbackPath = path; 
            }
        }
    });

    if (alreadyInjected) return true;

    let targetPath = exactMatchPath || fallbackPath;
    
    // For fixed/floating layout, append to root element instead of specific tag
    if (config.floating) {
        traverse(ast, {
            ReturnStatement(path) {
                if (t.isJSXElement(path.node.argument) || t.isJSXFragment(path.node.argument)) {
                    targetPath = path.get('argument');
                    path.stop();
                }
            }
        });
    }

    if (!targetPath || !targetPath.node) return false;

    const toggleJSX = t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('LanguageToggle'), [], true),
        null, [], true
    );

    // List wrapping logic
    let targetListPath = null;
    const targetName = targetPath.node.openingElement && targetPath.node.openingElement.name.name;
    if (targetName && ['ul', 'ol'].includes(targetName)) {
        targetListPath = targetPath;
    } else if (!config.floating) {
        targetPath.traverse({
            JSXElement(childPath) {
                const childName = childPath.node.openingElement.name.name;
                if (childName === 'ul' || childName === 'ol') {
                    targetListPath = childPath;
                    childPath.stop(); 
                }
            }
        });
    }

    const insertionPath = targetListPath || targetPath;

    const nodeToInsert = targetListPath 
        ? t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('li'), []), t.jsxClosingElement(t.jsxIdentifier('li')), [toggleJSX])
        : toggleJSX;

    if (!insertionPath.node.children) {
        insertionPath.node.children = [];
    }

    const children = insertionPath.node.children;
    let endSpace = t.jsxText('\n');
    let itemSpace = t.jsxText('\n  ');

    if (children.length > 0) {
        const last = children[children.length - 1];
        if (t.isJSXText(last) && last.value.trim() === '') {
            endSpace = children.pop(); 
            
            if (children.length > 0) {
                const prev = children[children.length - 2];
                if (prev && t.isJSXText(prev) && prev.value.trim() === '') {
                    itemSpace = t.jsxText(prev.value);
                } else {
                    itemSpace = t.jsxText(endSpace.value + '  ');
                }
            } else {
                itemSpace = t.jsxText(endSpace.value + '  ');
            }
        }
    }

    if (config.insertMode === 'prepend') {
        if (children.length === 0) {
             children.push(itemSpace, nodeToInsert, endSpace);
        } else {
             children.unshift(itemSpace, nodeToInsert);
        }
    } else {
        children.push(itemSpace);
        children.push(nodeToInsert);
        children.push(endSpace);
    }

    return true;
};
