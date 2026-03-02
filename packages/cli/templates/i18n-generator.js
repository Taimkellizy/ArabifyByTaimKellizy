import fs from 'fs/promises';
import path from 'path';

/**
 * Generates and writes the i18n.js configuration file to the src/ directory.
 * @param {string} cwd - Current working directory
 * @param {Array<string>} languages - Array of supported language codes (e.g., ['en', 'ar'])
 * @returns {Promise<void>}
 */
export async function generateI18nConfig(cwd, languages) {
  const fallbackLng = languages.length > 0 ? languages[0] : 'en';

  const content = `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: '${fallbackLng}',
    supportedLngs: ${JSON.stringify(languages)},
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    }
  });

export default i18n;
`;

  const srcDir = path.join(cwd, 'src');
  try {
    await fs.mkdir(srcDir, { recursive: true });
    await fs.writeFile(path.join(srcDir, 'i18n.js'), content, 'utf8');
  } catch (err) {
    throw new Error(`Failed to generate i18n.js: ${err.message}`);
  }
}
