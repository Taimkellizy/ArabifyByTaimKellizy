import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { 
  TranslatorService, 
  GoogleProvider, 
  DeepLProvider, 
  LibreProvider, 
  MockTranslationAdapter 
} from '@meridian/core';

export async function runTranslations(cwd, config, spinner = null) {
  if (!config || !config.translation || !config.translation.provider || config.translation.provider === 'manual') {
    return;
  }

  // Load .env if it exists
  dotenv.config({ path: path.join(cwd, '.env') });
  const apiKey = process.env.MERIDIAN_API_KEY || '';

  const providerName = config.translation.provider;
  let provider;

  try {
    if (providerName === 'google') {
      if (!apiKey) throw new Error('MERIDIAN_API_KEY is missing for Google Translate.');
      provider = new GoogleProvider(apiKey);
    } else if (providerName === 'deepl') {
      if (!apiKey) throw new Error('MERIDIAN_API_KEY is missing for DeepL.');
      provider = new DeepLProvider(apiKey);
    } else if (providerName === 'libre') {
      const url = config.translation.endpointUrl || 'https://translate.terraprint.co/translate';
      provider = new LibreProvider(apiKey, url);
    } else if (providerName === 'mock') {
      provider = new MockTranslationAdapter(apiKey);
    } else {
      throw new Error(`Unknown translation provider: ${providerName}`);
    }
  } catch (err) {
    if (spinner) spinner.error({ text: 'Failed to initialize translation provider' });
    console.error(chalk.red(`\n❌ Translation Setup Error: ${err.message}`));
    return;
  }

  const translator = new TranslatorService(provider);
  
  const defaultLang = config.defaultLanguage || 'en';
  const sourcePath = path.join(cwd, 'public', 'locales', defaultLang, 'translation.json');

  if (!fs.existsSync(sourcePath)) {
    if (spinner) spinner.error({ text: 'Source language file missing' });
    console.error(chalk.red(`\n❌ Translation Error: Could not find source file at ${sourcePath}`));
    return;
  }

  let sourceJSON;
  try {
    sourceJSON = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  } catch (err) {
    if (spinner) spinner.error({ text: 'Failed to parse source keys' });
    console.error(chalk.red(`\n❌ Translation Error: Failed to parse ${sourcePath}. Invalid JSON.`));
    return;
  }

  const targetLanguages = config.languages.filter(lang => lang !== defaultLang);
  
  if (targetLanguages.length === 0) {
    if (spinner) spinner.info({ text: 'No target languages specified.' });
    return;
  }

  console.log(chalk.cyan(`\n🌍 Starting Translation Process via ${providerName.toUpperCase()} API...`));

  for (const lang of targetLanguages) {
    console.log(chalk.gray(`  Translating into ${lang}...`));
    
    try {
      const translatedObj = await translator.translateObject(sourceJSON, lang, defaultLang);
      
      const targetDir = path.join(cwd, 'public', 'locales', lang);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      const targetPath = path.join(targetDir, 'translation.json');
      fs.writeFileSync(targetPath, JSON.stringify(translatedObj, null, 2), 'utf8');
      
      console.log(chalk.green(`  ✓ Generated: ${path.relative(cwd, targetPath)}`));
    } catch (err) {
      console.error(chalk.red(`  ❌ Failed to translate ${lang}: ${err.message}`));
      // We don't throw to avoid crashing the whole process; let it attempt other languages.
    }
  }
}
