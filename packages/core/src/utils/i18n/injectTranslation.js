import * as t from '@babel/types';

export const isReactComponent = (funcPath) => {
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

export const getReactComponentAncestor = (path) => {
    let current = path.findParent(p => p.isFunction());
    while (current) {
        if (isReactComponent(current)) {
            return current;
        }
        current = current.findParent(p => p.isFunction());
    }
    return null;
};

export const injectHook = (path, ctx) => {
    const parentFunc = getReactComponentAncestor(path);
    if (!parentFunc) return false;

    ctx.needsImport = true;

    if (!ctx.injectedNodeSet.has(parentFunc.node) && !parentFunc.scope.hasBinding('t')) {
        ctx.injectedNodeSet.add(parentFunc.node);
        
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

export const injectImportStatements = (ast) => {
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
};
