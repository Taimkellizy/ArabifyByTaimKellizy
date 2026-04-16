import { injectProvider, injectToggle } from '../../utils/reactInjector.js';

export const handleInjections = (codeString, foundTags, options) => {
    let modifiedCode = codeString;
    let injected = false;

    if (!['multi-lang', 'fix-lang', 'fix-all'].includes(options.mode)) {
        return { modifiedCode, injected };
    }

    // 1. Inject Provider if it's the App File
    if (options.isAppFile) {
        modifiedCode = injectProvider(modifiedCode, options.config);
        injected = true;
    }

    // 2. Inject Toggle based on user configuration
    let targetConfig = options.config?.languageSwitcher?.position || { tag: 'nav' };
    
    if (typeof targetConfig === 'string') {
        if (targetConfig === 'custom selector') targetConfig = { tag: 'nav' };
        else targetConfig = { tag: targetConfig };
    }

    let shouldInject = false;
    
    if (targetConfig.floating) {
        shouldInject = true;
    } else if (targetConfig.tag && (foundTags.has(targetConfig.tag) || targetConfig.tag === 'custom selector')) {
        shouldInject = true;
    } else if (foundTags.has('nav') || foundTags.has('header')) {
        shouldInject = true;
        targetConfig.tag = foundTags.has('nav') ? 'nav' : 'header';
    }

    if (shouldInject) {
        modifiedCode = injectToggle(modifiedCode, targetConfig);
        injected = true;
    }

    return { modifiedCode, injected };
};
