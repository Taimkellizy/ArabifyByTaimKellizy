import * as t from '@babel/types';
import generatorModule from '@babel/generator';
import chalk from 'chalk';
import { generateKey } from './hashKey.js';
import { injectHook } from './injectTranslation.js';

const generate = generatorModule.default?.generate || generatorModule.generate;

export const NEVER_WRAP_PROPS = [
    'className', 'key', 'id', 'href', 'src', 'onClick', 'style',
    'type', 'name', 'tabIndex', 'to', 'as', 'htmlFor'
];

export const ALWAYS_WRAP_PROPS = [
    'aria-label', 'placeholder', 'alt', 'title', 'children'
];

export function shouldWrapMemberExpression(propName, objectName, fieldName, registry) {
    if (NEVER_WRAP_PROPS.includes(propName)) return false;
    if (propName.startsWith('data-') || (propName.startsWith('aria-') && propName !== 'aria-label')) return false;

    if (ALWAYS_WRAP_PROPS.includes(propName)) return true;

    if (!registry) return false;

    let boundFile = null;
    for (const file of Object.keys(registry)) {
        const entry = registry[file];
        if (
            (entry.translatable && entry.translatable.includes(fieldName)) ||
            (entry.skip && entry.skip.includes(fieldName)) ||
            (entry.identifier && entry.identifier.includes(fieldName))
        ) {
            boundFile = file;
            break;
        }
    }

    if (!boundFile) {
        console.log(chalk.yellow(`⚠ Skipped uncertain expression: ${objectName}.${fieldName} — object not traced to a scanned data file. Add it to .meridianrc.json > dataFiles if it contains display text.`));
        return false;
    }

    const fileEntry = registry[boundFile];
    if (!fileEntry.translatable || !fileEntry.translatable.includes(fieldName)) {
        return false;
    }

    return true;
}

const generateCode = (node) => {
    const result = generate(node);
    return result.code;
};

export const buildExtractVisitor = (extractedMap, ctx) => ({
    JSXExpressionContainer(path) {
        const expr = path.node.expression;

        const extractMemberInfo = (node) => {
            if (!t.isMemberExpression(node) || node.computed) return null;
            if (!t.isIdentifier(node.property)) return null;

            const fieldName = node.property.name;

            let objectName = null;
            let cursor = node.object;
            while (t.isMemberExpression(cursor) && !cursor.computed) {
                if (t.isIdentifier(cursor.property)) {
                    objectName = cursor.property.name;
                }
                cursor = cursor.object;
            }
            if (t.isIdentifier(cursor)) {
                objectName = objectName || cursor.name;
            }
            if (!objectName) return null;

            return { objectName, fieldName, node };
        };

        if (t.isMemberExpression(expr)) {
            const info = extractMemberInfo(expr);
            if (!info) return;

            let propName = 'children';
            if (path.parentPath.isJSXAttribute()) {
                propName = path.parentPath.node.name.name;
            } else if (!path.parentPath.isJSXElement() && !path.parentPath.isJSXFragment()) {
                return;
            }

            if (shouldWrapMemberExpression(propName, info.objectName, info.fieldName, ctx.registry)) {
                if (!injectHook(path, ctx)) return;
                const newExpr = t.callExpression(t.identifier('t'), [expr]);
                ctx.edits.push({
                    start: expr.start,
                    end: expr.end,
                    replacement: generateCode(newExpr)
                });
                path.skip();
            }
            return;
        }

        if (t.isConditionalExpression(expr)) {
            const info = extractMemberInfo(expr.consequent);
            if (info) {
                const propName = path.parentPath.isJSXAttribute()
                    ? path.parentPath.node.name.name
                    : 'children';

                if (shouldWrapMemberExpression(propName, info.objectName, info.fieldName, ctx.registry)) {
                    if (!injectHook(path, ctx)) return;
                    const newConsequent = t.callExpression(t.identifier('t'), [info.node]);
                    ctx.edits.push({
                        start: expr.consequent.start,
                        end: expr.consequent.end,
                        replacement: generateCode(newConsequent)
                    });
                }
            }
            
            // Also handle the alternate (fallback) if it's a string literal
            if (t.isStringLiteral(expr.alternate)) {
                const strValue = expr.alternate.value;
                if (strValue && strValue.trim()) {
                    if (!injectHook(path, ctx)) return;
                    
                    const key = strValue;
                    extractedMap.set(key, strValue);
                    
                    const newAlternate = t.callExpression(t.identifier('t'), [t.stringLiteral(key)]);
                    ctx.edits.push({
                        start: expr.alternate.start,
                        end: expr.alternate.end,
                        replacement: generateCode(newAlternate)
                    });
                }
            }
            return;
        }

        if (t.isIdentifier(expr) && path.parentPath.isJSXElement()) {
            const varName = expr.name;
            if (ctx.registry) {
                for (const entry of Object.values(ctx.registry)) {
                    if (entry.translatable && entry.translatable.includes(varName)) {
                        if (!injectHook(path, ctx)) return;
                        const newExpr = t.callExpression(t.identifier('t'), [expr]);
                        ctx.edits.push({
                            start: expr.start,
                            end: expr.end,
                            replacement: generateCode(newExpr)
                        });
                        path.skip();
                        return;
                    }
                }
            }
        }
    },
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

        opening.attributes.forEach((attr) => {
            if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
                if (['placeholder', 'alt', 'title'].includes(attr.name.name)) {
                    if (t.isStringLiteral(attr.value) && attr.value.value.trim() !== '') {
                        if (!injectHook(path, ctx)) return; 

                        const strValue = attr.value.value;
                        const key = generateKey(strValue);
                        extractedMap.set(key, strValue);

                        const newValue = t.jsxExpressionContainer(
                            t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
                        );
                        ctx.edits.push({
                            start: attr.value.start,
                            end: attr.value.end,
                            replacement: generateCode(newValue)
                        });
                    }
                }
            }
        });

        let i = 0;
        const childEditRanges = [];
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
                    i++;
                    continue;
                }

                const normalizedText = textStr.trim().replace(/\s+/g, ' ');
                if (hasText && normalizedText.length > 0) {
                    if (variables.length > 0 && ctx.registry) {
                        let allTranslatable = true;
                        for (const varProp of variables) {
                            const varExpr = varProp.value;
                            let isTranslatable = false;

                            if (t.isMemberExpression(varExpr) && !varExpr.computed && t.isIdentifier(varExpr.property)) {
                                const fieldName = varExpr.property.name;
                                for (const entry of Object.values(ctx.registry)) {
                                    if (entry.translatable && entry.translatable.includes(fieldName)) {
                                        isTranslatable = true;
                                        break;
                                    }
                                }
                            }
                            if (!isTranslatable) {
                                allTranslatable = false;
                                break;
                            }
                        }

                        if (allTranslatable) {
                            if (injectHook(path, ctx)) {
                                modified = true;
                                for (let k = i; k < j; k++) {
                                    const c = path.node.children[k];
                                    if (t.isJSXExpressionContainer(c) && !t.isJSXEmptyExpression(c.expression)) {
                                        const innerExpr = c.expression;
                                        const newExpr = t.callExpression(t.identifier('t'), [innerExpr]);
                                        childEditRanges.push({
                                            start: innerExpr.start,
                                            end: innerExpr.end,
                                            replacement: generateCode(newExpr)
                                        });
                                    }
                                }
                                i = j;
                                continue;
                            }
                        }
                    }

                    if (!injectHook(path, ctx)) {
                        for (let k = i; k < j; k++) {
                            childEditRanges.push({
                                start: path.node.children[k].start,
                                end: path.node.children[k].end,
                                replacement: null
                            });
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

                        let editStart = i;
                        let editEnd = j;
                        let replacement = '';
                        
                        if (leadingMatch) {
                            replacement += leadingMatch[0];
                        }

                        const expression = t.callExpression(t.identifier('t'), params);
                        replacement += generateCode(t.jsxExpressionContainer(expression));

                        if (trailingMatch && trailingMatch[0] !== textStr) {
                            replacement += trailingMatch[0];
                        }

                        childEditRanges.push({
                            start: path.node.children[i].start,
                            end: path.node.children[j - 1].end,
                            replacement: replacement
                        });
                    }
                } else if (!hasText && variables.length === 1) {
                    const onlyExprContainer = path.node.children.slice(i, j).find(
                        c => t.isJSXExpressionContainer(c) && !t.isJSXEmptyExpression(c.expression)
                    );
                    if (onlyExprContainer) {
                        const innerExpr = onlyExprContainer.expression;
                        let shouldWrap = false;

                        if (t.isMemberExpression(innerExpr) && !innerExpr.computed && t.isIdentifier(innerExpr.property)) {
                            const fieldName = innerExpr.property.name;
                            let objName = null;
                            let cur = innerExpr.object;
                            while (t.isMemberExpression(cur) && !cur.computed) {
                                if (t.isIdentifier(cur.property)) objName = cur.property.name;
                                cur = cur.object;
                            }
                            if (t.isIdentifier(cur)) objName = objName || cur.name;
                            if (objName) {
                                shouldWrap = shouldWrapMemberExpression('children', objName, fieldName, ctx.registry);
                            }
                        } else if (t.isIdentifier(innerExpr) && ctx.registry) {
                            for (const entry of Object.values(ctx.registry)) {
                                if (entry.translatable && entry.translatable.includes(innerExpr.name)) {
                                    shouldWrap = true;
                                    break;
                                }
                            }
                        }

                        if (shouldWrap && injectHook(path, ctx)) {
                            modified = true;
                            const newExpr = t.callExpression(t.identifier('t'), [innerExpr]);
                            childEditRanges.push({
                                start: innerExpr.start,
                                end: innerExpr.end,
                                replacement: generateCode(newExpr)
                            });
                        } else {
                            for (let k = i; k < j; k++) {
                                childEditRanges.push({
                                    start: path.node.children[k].start,
                                    end: path.node.children[k].end,
                                    replacement: null
                                });
                            }
                        }
                    } else {
                        for (let k = i; k < j; k++) {
                            childEditRanges.push({
                                start: path.node.children[k].start,
                                end: path.node.children[k].end,
                                replacement: null
                            });
                        }
                    }
                } else {
                    for (let k = i; k < j; k++) {
                        childEditRanges.push({
                            start: path.node.children[k].start,
                            end: path.node.children[k].end,
                            replacement: null
                        });
                    }
                }
                i = j;

            } else {
                i++;
            }
        }

        if (modified) {
            for (const range of childEditRanges) {
                if (range.replacement !== null) {
                    ctx.edits.push(range);
                }
            }
        }
    }
});