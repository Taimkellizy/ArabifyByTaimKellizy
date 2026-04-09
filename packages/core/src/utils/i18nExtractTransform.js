import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import { injectImportStatements } from './i18n/injectTranslation.js';
import { buildExtractVisitor } from './i18n/extractJSX.js';

const traverse = _traverse.default || _traverse;
const generate = _generate.default || _generate;

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
    const ctx = {
        needsImport: false,
        injectedNodeSet: new Set()
    };

    const visitor = buildExtractVisitor(extractedStrings, ctx);
    traverse(ast, visitor);

    if (ctx.needsImport) {
        injectImportStatements(ast);
    }

    const output = generate(ast, {
        retainLines: true,
        concise: false
    }, codeString);
    
    return { modifiedCode: output.code, extractedStrings };
};
