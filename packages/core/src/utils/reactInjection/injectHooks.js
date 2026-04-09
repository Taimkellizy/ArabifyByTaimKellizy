import * as t from '@babel/types';

export const injectContextHook = (componentFunctionPath, collision, textDecRemovalPath, useI18next) => {
    if (useI18next) return;

    if (textDecRemovalPath) {
        textDecRemovalPath.remove();
        collision = false;
    }

    const varName = collision ? 'arabifyContextvalue' : 'text';
    const objProp = t.objectProperty(
        t.identifier('text'), 
        t.identifier(varName), 
        false, 
        !collision
    );

    const hookDecl = t.variableDeclaration('const', [
        t.variableDeclarator(
            t.objectPattern([objProp]),
            t.callExpression(t.identifier('useContext'), [t.identifier('LanguageContext')])
        )
    ]);

    const nullCheck = t.ifStatement(
        t.unaryExpression('!', t.identifier(varName)),
        t.returnStatement(t.nullLiteral())
    );

    const bodyPath = componentFunctionPath.get('body');
    if (bodyPath.isBlockStatement()) {
        bodyPath.unshiftContainer('body', [hookDecl, nullCheck]);
    } else {
        const block = t.blockStatement([
            hookDecl,
            nullCheck,
            t.returnStatement(bodyPath.node)
        ]);
        bodyPath.replaceWith(block);
    }
};
