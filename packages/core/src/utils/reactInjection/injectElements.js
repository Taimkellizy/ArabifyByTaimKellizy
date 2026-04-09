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

export const injectToggleNode = (ast, targetPos) => {
    let targetListPath = null;
    let targetNodePath = null;
    let headerNodePath = null;
    let alreadyInjected = false;

    traverse(ast, {
        JSXElement(path) {
            const name = path.node.openingElement.name.name;
            if (name === targetPos) {
                targetNodePath = path;
                path.traverse({
                    JSXElement(childPath) {
                        const childName = childPath.node.openingElement.name.name;
                        if (childName === 'ul' || childName === 'ol') {
                            targetListPath = childPath;
                            childPath.stop(); 
                        }
                    }
                });
            }
            if (name === "LanguageToggle") alreadyInjected = true;
            if (name === "header") headerNodePath = path;
        }
    });

    if (alreadyInjected) return true;

    const target = targetListPath || targetNodePath || headerNodePath;
    if (!target) return false;

    const toggleJSX = t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('LanguageToggle'), [], true),
        null, [], true
    );

    const nodeToInsert = targetListPath 
        ? t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('li'), []), t.jsxClosingElement(t.jsxIdentifier('li')), [toggleJSX])
        : toggleJSX;

    target.node.children.push(nodeToInsert);
    return true;
};
