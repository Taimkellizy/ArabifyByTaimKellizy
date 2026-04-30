import { parse } from '@babel/parser';
import * as t from '@babel/types';
import { applyEdits } from './i18n/applyEdits.js';
import { analyzeProviderScope } from './reactInjection/detectScope.js';
import { generateImportEdits, generateToggleImportEdits } from './reactInjection/injectImports.js';
import { injectContextHook, analyzeHookInfo } from './reactInjection/injectHooks.js';
import { analyzeExportDefault, analyzeToggleTarget, generateProviderWrapperEdit, generateToggleInsertEdit } from './reactInjection/injectElements.js';

/**
 * Parses source code into AST with support for JSX, TypeScript, and modern JS features.
 * @param {string} code - Source code to parse
 * @returns {import('@babel/parser').ParseResult} Parsed AST
 */
const getAST = (code) => {
    return parse(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript", "classProperties", "dynamicImport", "exportDefaultFrom", "exportNamespaceFrom"],
    });
};

/**
 * Injects LanguageProvider wrapper by finding the export default and replacing it with a wrapped version.
 * Uses AST for detection only - string replacement for actual modification.
 * @param {string} code - Source code to modify
 * @param {Object} config - Configuration options
 * @param {string} fileName - Current file name
 * @returns {string} Modified code
 */
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

    const edits = [];

    const importEdits = generateImportEdits(code, ast, fileName, {
        hasContextImport: scope.hasContextImport,
        hasReactImport: scope.hasReactImport,
        useI18next: config.i18next
    });
    edits.push(...importEdits);

    const hookInfo = analyzeHookInfo(ast, scope);
    if (!scope.hasHook && scope.componentFunctionPath && !config.i18next) {
        const hookInjection = injectContextHook(hookInfo, {
            collision: scope.collisionDetected,
            useI18next: config.i18next,
            textDecRemovalRange: scope.textDeclarationToRemovePath ? {
                start: scope.textDeclarationToRemovePath.node.start,
                end: scope.textDeclarationToRemovePath.node.end
            } : null
        });
        if (hookInjection) {
            if (hookInjection.removeRange) {
                edits.push({
                    start: hookInjection.removeRange.start,
                    end: hookInjection.removeRange.end,
                    replacement: ''
                });
            }
            if (hookInjection.hookEdit) {
                edits.push(hookInjection.hookEdit);
            }
        }
    }

    if (!scope.hasProviderWrapper) {
        const exportInfo = analyzeExportDefault(ast);
        const wrapperEdit = generateProviderWrapperEdit(code, exportInfo);
        if (wrapperEdit) {
            edits.push(wrapperEdit);
        }
    }

    if (edits.length === 0) return code;

    try {
        return applyEdits(code, edits);
    } catch (e) {
        console.error("Error applying provider edits:", e.message);
        return code;
    }
};

/**
 * Injects LanguageToggle component into target element.
 * Uses AST for detection - string insertion for actual modification.
 * @param {string} code - Source code to modify
 * @param {Object} targetConfig - Target element configuration
 * @param {string} fileName - Current file name
 * @returns {{code: string, injected: boolean}} Result with modified code and injected status
 */
export const injectToggle = (code, targetConfig = { tag: "nav" }, fileName = '') => {
    let ast;
    try {
        ast = getAST(code);
    } catch (e) {
        console.error("Parse Error in injectToggle:", e);
        return { code, injected: false };
    }

    const edits = [];

    const importEdits = generateToggleImportEdits(code, ast, fileName);
    edits.push(...importEdits);

    const targetInfo = analyzeToggleTarget(ast, targetConfig);
    
    if (targetInfo && !targetInfo.alreadyInjected && targetInfo.targetNode) {
        const toggleEdit = generateToggleInsertEdit(code, targetInfo);
        if (toggleEdit) {
            edits.push(toggleEdit);
        }
    }

    if (edits.length === 0) {
        return { code, injected: false };
    }

    try {
        const result = applyEdits(code, edits);
        return { code: result, injected: !!targetInfo && !targetInfo.alreadyInjected };
    } catch (e) {
        console.error("Error applying toggle edits:", e.message);
        return { code, injected: false };
    }
};