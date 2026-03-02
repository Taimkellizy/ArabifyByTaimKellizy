import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import * as t from '@babel/types';

const traverse = _traverse.default || _traverse;
const generate = _generate.default || _generate;

const generateKey = (textStr) => {
    if (textStr.length <= 50) {
        return textStr;
    }
    const words = textStr.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
    const prefix = words.slice(0, 5).join('_').toLowerCase();
    
    let hash = 0;
    for (let i = 0; i < textStr.length; i++) {
        const char = textStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const hashStr = Math.abs(hash).toString(16).substring(0, 4).padStart(4, '0');
    
    return prefix ? `${prefix}_${hashStr}` : hashStr;
};

export const extractAndTransformJSX = (codeString, options = {}) => {
    let ast;
    try {
        const isTS = options.fileName && options.fileName.toLowerCase().endsWith('.ts') && !options.fileName.toLowerCase().endsWith('.tsx');
        const plugins = [
            'typescript', 
            'decorators-legacy',
            'classProperties'
        ];
        if (!isTS) {
            plugins.push('jsx');
        }

        ast = parse(codeString, {
            sourceType: 'module',
            plugins
        });
    } catch (e) {
        console.error("Parse Error in extractAndTransformJSX:", e);
        return { modifiedCode: codeString, extractedStrings: new Map() };
    }

    const extractedStrings = new Map();
    let needsImport = false;
    const injectedFunctions = new Set();

    const isReactComponent = (funcPath) => {
        if (t.isFunctionDeclaration(funcPath.node) && funcPath.node.id) {
            return /^[A-Z]/.test(funcPath.node.id.name);
        }
        if (funcPath.parentPath.isVariableDeclarator() && t.isIdentifier(funcPath.parentPath.node.id)) {
            return /^[A-Z]/.test(funcPath.parentPath.node.id.name);
        }
        if (funcPath.parentPath.isExportDefaultDeclaration()) {
            return true;
        }
        return false;
    };

    const getReactComponentAncestor = (path) => {
        let current = path.findParent(p => p.isFunction());
        while (current) {
            if (isReactComponent(current)) {
                return current;
            }
            current = current.findParent(p => p.isFunction());
        }
        return null;
    };

    const injectHook = (path) => {
        const parentFunc = getReactComponentAncestor(path);
        if (!parentFunc) return false;

        needsImport = true;
        if (!injectedFunctions.has(parentFunc.node) && !parentFunc.scope.hasBinding('t')) {
            injectedFunctions.add(parentFunc.node);
            
            const tDecl = t.variableDeclaration('const', [
                t.variableDeclarator(
                    t.objectPattern([
                        t.objectProperty(t.identifier('t'), t.identifier('t'), false, true)
                    ]),
                    t.callExpression(t.identifier('useTranslation'), [])
                )
            ]);

            const bodyPath = parentFunc.get('body');
            if (bodyPath.isBlockStatement()) {
                bodyPath.unshiftContainer('body', tDecl);
            } else {
                const returnStmt = t.returnStatement(bodyPath.node);
                const block = t.blockStatement([tDecl, returnStmt]);
                bodyPath.replaceWith(block);
            }
        }
        return true;
    };

    traverse(ast, {
        JSXElement(path) {
            const opening = path.node.openingElement;
            
            if (opening.attributes) {
                const hasIgnore = opening.attributes.some(attr => 
                    t.isJSXAttribute(attr) && attr.name.name === 'data-meridian-ignore'
                );
                if (hasIgnore) {
                    path.skip();
                    return;
                }
            }

            // 2. Extract Attributes
            opening.attributes.forEach((attr) => {
                if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
                    if (['placeholder', 'alt', 'title'].includes(attr.name.name)) {
                        if (t.isStringLiteral(attr.value) && attr.value.value.trim() !== '') {
                            if (!injectHook(path)) return; // Skip if no component ancestor

                            const strValue = attr.value.value;
                            const key = generateKey(strValue);
                            extractedStrings.set(key, strValue);

                            attr.value = t.jsxExpressionContainer(
                                t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
                            );
                        }
                    }
                }
            });

            // 3. Process children
            let i = 0;
            const newChildren = [];
            while (i < path.node.children.length) {
                const child = path.node.children[i];

                if (t.isJSXText(child) || (t.isJSXExpressionContainer(child) && !t.isJSXEmptyExpression(child.expression))) {
                    let textStr = '';
                    const variables = [];
                    let j = i;
                    let hasText = false;

                    while (j < path.node.children.length) {
                        const sibling = path.node.children[j];
                        if (t.isJSXText(sibling)) {
                            // Convert newlines and multiple spaces to a single space
                            const val = sibling.value;
                            textStr += val;
                            if (val.trim() !== '') hasText = true;
                            j++;
                        } else if (t.isJSXExpressionContainer(sibling) && !t.isJSXEmptyExpression(sibling.expression)) {
                            if (t.isIdentifier(sibling.expression) || t.isMemberExpression(sibling.expression)) {
                                let varName = 'var' + variables.length;
                                if (t.isIdentifier(sibling.expression)) {
                                    varName = sibling.expression.name;
                                } else if (t.isMemberExpression(sibling.expression)) {
                                    if (t.isIdentifier(sibling.expression.property)) {
                                        varName = sibling.expression.property.name;
                                    }
                                }
                                textStr += `{{${varName}}}`;
                                
                                let isShorthand = false;
                                if (t.isIdentifier(sibling.expression) && sibling.expression.name === varName) {
                                    isShorthand = true;
                                }
                                
                                variables.push(t.objectProperty(t.identifier(varName), sibling.expression, false, isShorthand));
                                j++;
                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    }

                    const normalizedText = textStr.trim().replace(/\s+/g, ' ');
                    if (hasText && normalizedText.length > 0) {
                        if (!injectHook(path)) {
                            // If no component ancestor, keep original nodes
                            for (let k = i; k < j; k++) {
                                newChildren.push(path.node.children[k]);
                            }
                        } else {
                            const key = generateKey(normalizedText);
                            extractedStrings.set(key, normalizedText);

                            const params = [t.stringLiteral(key)];
                            if (variables.length > 0) {
                                params.push(t.objectExpression(variables));
                            }

                            const hasLeadingSpace = /^\s/.test(textStr);
                            const hasTrailingSpace = /\s$/.test(textStr);

                            let expression = t.callExpression(t.identifier('t'), params);

                            if (hasLeadingSpace) {
                                expression = t.binaryExpression('+', t.stringLiteral(' '), expression);
                            }

                            if (hasTrailingSpace) {
                                expression = t.binaryExpression('+', expression, t.stringLiteral(' '));
                            }

                            newChildren.push(t.jsxExpressionContainer(expression));
                        }
                    } else {
                        // Keep original nodes if no actual text was extracted
                        for (let k = i; k < j; k++) {
                            newChildren.push(path.node.children[k]);
                        }
                    }
                    i = j;

                } else {
                    newChildren.push(child);
                    i++;
                }
            }

            path.node.children = newChildren;
        }
    });

    if (needsImport) {
        let hasImport = false;
        let hasUseTranslation = false;
        
        ast.program.body.forEach(node => {
            if (t.isImportDeclaration(node) && node.source.value === 'react-i18next') {
                hasImport = true;
                node.specifiers.forEach(s => {
                    if (t.isImportSpecifier(s) && s.imported.name === 'useTranslation') {
                        hasUseTranslation = true;
                    }
                });
                if (!hasUseTranslation) {
                    node.specifiers.push(t.importSpecifier(t.identifier('useTranslation'), t.identifier('useTranslation')));
                }
            }
        });

        if (!hasImport) {
            const importDecl = t.importDeclaration(
                [t.importSpecifier(t.identifier('useTranslation'), t.identifier('useTranslation'))],
                t.stringLiteral('react-i18next')
            );
            ast.program.body.unshift(importDecl);
        }
    }

    const output = generate(ast, {
        retainLines: true,
        concise: false
    }, codeString);

    let finalCode = output.code;
    
    // Fix spacing issues caused by retainLines: true merging newly injected nodes
    finalCode = finalCode.replace(/}import/g, "}\nimport").replace(/;import/g, ";\nimport");
    finalCode = finalCode.replace(/\{const \{ t \} = useTranslation\(\);/g, "{\n  const { t } = useTranslation();\n");

    return { modifiedCode: finalCode, extractedStrings };
};
