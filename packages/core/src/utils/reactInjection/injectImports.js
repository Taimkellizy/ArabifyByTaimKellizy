import * as t from '@babel/types';
import path from 'path';

const getRelativeImport = (fileName, targetSubPath) => {
    if (!fileName) return `./${targetSubPath}`;
    
    const normalizedFileName = fileName.replace(/\\/g, '/');
    const parts = normalizedFileName.split('/');
    const rootIndex = parts.findIndex(p => ['src', 'app', 'pages', 'components'].includes(p));
    
    let baseDir = '.';
    if (rootIndex !== -1) {
        baseDir = parts.slice(0, rootIndex + 1).join('/');
    }
    
    const fileDir = normalizedFileName.includes('/') ? normalizedFileName.substring(0, normalizedFileName.lastIndexOf('/')) : '.';
    
    let relative = path.posix.relative(fileDir, `${baseDir}/${targetSubPath}`);
    if (!relative.startsWith('.')) {
        relative = './' + relative;
    }
    return relative;
};

export const injectProviderImports = (ast, hasContextImport, hasReactImport, useI18next, fileName) => {
    // 1. LanguageContext
    if (!hasContextImport) {
        const importPath = getRelativeImport(fileName, 'contexts/LanguageContext');
        const importDecl = t.importDeclaration(
            [
                t.importSpecifier(t.identifier('LanguageProvider'), t.identifier('LanguageProvider')),
                t.importSpecifier(t.identifier('LanguageContext'), t.identifier('LanguageContext'))
            ],
            t.stringLiteral(importPath)
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

export const injectToggleImports = (ast, fileName) => {
    let alreadyImported = false;
    ast.program.body.forEach(node => {
        if (t.isImportDeclaration(node) && node.source.value.includes('LanguageToggle')) {
            alreadyImported = true;
        }
    });

    if (!alreadyImported) {
        const importPath = getRelativeImport(fileName, 'components/LanguageToggle');
        const importDecl = t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier('LanguageToggle'))],
            t.stringLiteral(importPath)
        );
        ast.program.body.unshift(importDecl);
    }
    return alreadyImported;
};
