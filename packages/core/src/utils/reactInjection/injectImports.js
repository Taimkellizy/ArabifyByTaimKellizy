import * as t from '@babel/types';

export const injectProviderImports = (ast, hasContextImport, hasReactImport, useI18next) => {
    // 1. LanguageContext
    if (!hasContextImport) {
        const importDecl = t.importDeclaration(
            [
                t.importSpecifier(t.identifier('LanguageProvider'), t.identifier('LanguageProvider')),
                t.importSpecifier(t.identifier('LanguageContext'), t.identifier('LanguageContext'))
            ],
            t.stringLiteral('./contexts/LanguageContext')
        );
        ast.program.body.unshift(importDecl);
    }
    // 2. React useContext
    if (!hasReactImport && !useI18next) {
        const reactDecl = t.importDeclaration(
            [t.importSpecifier(t.identifier('useContext'), t.identifier('useContext'))],
            t.stringLiteral('react')
        );
        ast.program.body.unshift(reactDecl);
    }
};

export const injectToggleImports = (ast) => {
    let alreadyImported = false;
    ast.program.body.forEach(node => {
        if (t.isImportDeclaration(node) && node.source.value.includes('LanguageToggle')) {
            alreadyImported = true;
        }
    });

    if (!alreadyImported) {
        const importDecl = t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier('LanguageToggle'))],
            t.stringLiteral('./components/LanguageToggle')
        );
        ast.program.body.unshift(importDecl);
    }
    return alreadyImported;
};
