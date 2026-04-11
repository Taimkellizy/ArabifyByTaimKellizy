import analyzeCSS from './src/analyzeCSS.js';
import analyzeJSX from './src/analyzeJSX.js';
import analyzeHTML from './src/analyzeHTML.js';
import { extractAndTransformJSX } from './src/utils/i18nExtractTransform.js';
import { contextTemplate, i18nContextTemplate, toggleTemplate } from './src/utils/reactGenerators.js';

import { TranslatorService } from './src/translator/index.js';
import GoogleProvider from './src/translator/providers/GoogleProvider.js';
import DeepLProvider from './src/translator/providers/DeepLProvider.js';
import LibreProvider from './src/translator/providers/LibreProvider.js';
import MockTranslationAdapter from './src/translator/providers/MockTranslationAdapter.js';

export { 
    analyzeCSS, 
    analyzeJSX, 
    analyzeHTML, 
    extractAndTransformJSX, 
    contextTemplate, 
    i18nContextTemplate, 
    toggleTemplate,
    TranslatorService,
    GoogleProvider,
    DeepLProvider,
    LibreProvider,
    MockTranslationAdapter
};
