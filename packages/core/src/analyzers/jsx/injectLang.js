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
    const targetPos = options.config?.languageSwitcher?.position || 'nav';
    let shouldInject = false;
    
    if (targetPos === 'custom selector') {
        shouldInject = true;
    } else if (foundTags.has(targetPos)) {
        shouldInject = true;
    } else if (foundTags.has('nav') || foundTags.has('header')) {
        shouldInject = true;
    }

    if (shouldInject) {
        modifiedCode = injectToggle(modifiedCode, targetPos);
        injected = true;
    }

    return { modifiedCode, injected };
};
