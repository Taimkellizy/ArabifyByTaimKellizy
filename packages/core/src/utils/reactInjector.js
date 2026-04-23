import { parse } from '@babel/parser';
import _generate from '@babel/generator';
import { analyzeProviderScope } from './reactInjection/detectScope.js';
import { injectProviderImports, injectToggleImports } from './reactInjection/injectImports.js';
import { injectContextHook } from './reactInjection/injectHooks.js';
import { wrapExportWithProvider, injectToggleNode } from './reactInjection/injectElements.js';

const generate = _generate.default || _generate;

const getAST = (code) => {
    return parse(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript", "classProperties", "dynamicImport", "exportDefaultFrom", "exportNamespaceFrom"],
    });
};

export const injectProvider = (code, config = {}, fileName = '') => {
    let ast;
    try {
        ast = getAST(code);
    } catch (e) {
        console.error("Parse Error in injectProvider:", e);
        return code;
    }

    const scope = analyzeProviderScope(ast);

    const isFullyInjected = config.i18next 
        ? (scope.hasContextImport && scope.hasProviderWrapper) 
        : (scope.hasContextImport && scope.hasHook && scope.hasProviderWrapper);

    if (isFullyInjected) return code;
    if (!scope.exportDefaultNodePath) return code;

    injectProviderImports(ast, scope.hasContextImport, scope.hasReactImport, config.i18next, fileName);

    if (!scope.hasHook && scope.componentFunctionPath) {
        injectContextHook(scope.componentFunctionPath, scope.collisionDetected, scope.textDeclarationToRemovePath, config.i18next);
    }

    if (!scope.hasProviderWrapper) {
        wrapExportWithProvider(ast, scope.exportDefaultNodePath, scope.exportName);
    }

    const output = generate(ast, { retainLines: false, sourceMaps: false }, code);
    return output.code;
};

export const injectToggle = (code, targetConfig = { tag: "nav" }, fileName = '') => {
    let ast;
    try {
        ast = getAST(code);
    } catch (e) {
        console.error("Parse Error in injectToggle:", e);
        return code;
    }

    const wasAlreadyImported = injectToggleImports(ast, fileName);
    const successfullyInjected = injectToggleNode(ast, targetConfig);

    if (!successfullyInjected && !wasAlreadyImported) return code;

    const output = generate(ast, { retainLines: false, sourceMaps: false }, code);
    return output.code;
};
