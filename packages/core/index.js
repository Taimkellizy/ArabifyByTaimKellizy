import analyzeCSS from './src/analyzeCSS.js';
import analyzeJSX from './src/analyzeJSX.js';
import analyzeHTML from './src/analyzeHTML.js';
import { extractAndTransformJSX } from './src/utils/i18nExtractTransform.js';
import { contextTemplate, i18nContextTemplate, toggleTemplate } from './src/utils/reactGenerators.js';

export { analyzeCSS, analyzeJSX, analyzeHTML, extractAndTransformJSX, contextTemplate, i18nContextTemplate, toggleTemplate };
