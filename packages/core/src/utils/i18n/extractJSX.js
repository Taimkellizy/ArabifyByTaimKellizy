import * as t from '@babel/types';
import { generateKey } from './hashKey.js';
import { injectHook } from './injectTranslation.js';

export const buildExtractVisitor = (extractedMap, ctx) => ({
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

        // Extract textual Attributes (placeholder, alt, title)
        opening.attributes.forEach((attr) => {
            if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
                if (['placeholder', 'alt', 'title'].includes(attr.name.name)) {
                    if (t.isStringLiteral(attr.value) && attr.value.value.trim() !== '') {
                        if (!injectHook(path, ctx)) return; 

                        const strValue = attr.value.value;
                        const key = generateKey(strValue);
                        extractedMap.set(key, strValue);

                        attr.value = t.jsxExpressionContainer(
                            t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
                        );
                    }
                }
            }
        });

        let i = 0;
        const newChildren = [];
        let modified = false;
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

                if (j === i) {
                    newChildren.push(child);
                    i++;
                    continue;
                }

                const normalizedText = textStr.trim().replace(/\s+/g, ' ');
                if (hasText && normalizedText.length > 0) {
                    if (!injectHook(path, ctx)) {
                        for (let k = i; k < j; k++) {
                            newChildren.push(path.node.children[k]);
                        }
                    } else {
                        modified = true;
                        const key = generateKey(normalizedText);
                        extractedMap.set(key, normalizedText);

                        const params = [t.stringLiteral(key)];
                        if (variables.length > 0) {
                            params.push(t.objectExpression(variables));
                        }

                        const leadingMatch = textStr.match(/^\s+/);
                        const trailingMatch = textStr.match(/\s+$/);

                        if (leadingMatch) {
                            newChildren.push(t.jsxText(leadingMatch[0]));
                        }

                        let expression = t.callExpression(t.identifier('t'), params);
                        newChildren.push(t.jsxExpressionContainer(expression));

                        if (trailingMatch && trailingMatch[0] !== textStr) {
                            newChildren.push(t.jsxText(trailingMatch[0]));
                        }
                    }
                } else {
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

        if (modified) {
            path.node.children = newChildren;
        }
    }
});
