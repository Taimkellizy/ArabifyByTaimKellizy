import { parse } from '@babel/parser';

export const parseCode = (codeString, fileName = '') => {
    const isTS = fileName && fileName.toLowerCase().endsWith('.ts') && !fileName.toLowerCase().endsWith('.tsx');
    const plugins = [
        'typescript', 
        'classProperties', 
        'dynamicImport', 
        'exportDefaultFrom', 
        'exportNamespaceFrom'
    ];

    if (!isTS) {
        plugins.push('jsx');
    }

    return parse(codeString, {
        sourceType: 'module',
        plugins: plugins
    });
};
