#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import { createSpinner } from 'nanospinner';
import { saveConfig } from '../utils/config.js';
import { runModifications } from '../utils/runner.js';
import { runTranslations } from '../utils/translator-runner.js';
import { runSync } from '../utils/sync-runner.js';
import { getToggleTemplate } from '@meridian/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get version from package.json
const packageJsonPath = path.join(__dirname, '../package.json');
let version = '1.0.0';
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  version = packageJson.version;
} catch (e) {
  // fallback if file not found
}

program
  .name('meridian')
  .description('Meridian Suite: The ultimate i18n automation tool')
  .version(version);

program
  .command('init')
  .description('Initialize meridian in your project and setup i18n')
  .action(async () => {
    // Display Banner
    console.log('');
    console.log(chalk.cyan(figlet.textSync('MERIDIAN', { font: 'isometric3', horizontalLayout: 'fitted' })));
    console.log(chalk.bold.blue('Welcome to the Meridian Suite CLI!\n'));
    
    /**
     * @typedef {Object} ModeAnswer
     * @property {string[]} mode
     */

    /** @type {ModeAnswer} */
    const { mode } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'mode',
        message: 'How do you want to set up Meridian? (Select strictly ONE using space, then press enter)',
        choices: [
          { name: 'Quick Start (recommended defaults)', value: 'Quick Start' },
          { name: 'Advanced (configure everything manually)', value: 'Advanced' }
        ],
        validate(answer) {
          if (answer.length !== 1) {
            return 'You must select exactly one option.';
          }
          return true;
        }
      }
    ]);

    /** @type {Object} */
    let answers;

    if (mode[0] === 'Quick Start') {
      /** @type {Object} */
      const qsAnswers = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'languages',
          message: 'Which languages do you want to support?',
          choices: ['en', 'ar', 'es', 'fr', 'de', 'zh'],
          default: ['en', 'ar']
        },
        {
          type: 'confirm',
          name: 'useApi',
          message: 'Do you want to auto-translate extracted strings using an API?',
          default: true
        },
        {
          type: 'checkbox',
          name: 'translationMethod',
          message: 'Which translation provider do you want to use? (Select strictly ONE using space, then press enter)',
          choices: ['Google API', 'DeepL', 'LibreTranslate', 'Mock (Local Testing)'],
          validate(answer) {
            if (answer.length !== 1) {
              return 'You must select exactly one API provider.';
            }
            return true;
          },
          when: (answers) => answers.useApi
        },
        {
          type: 'password',
          name: 'apiKey',
          message: 'Enter your API key:',
          when: (answers) => answers.useApi && answers.translationMethod && (answers.translationMethod[0] === 'Google API' || answers.translationMethod[0] === 'DeepL')
        },
        {
          type: 'input',
          name: 'libreUrl',
          message: 'Enter your LibreTranslate endpoint URL:',
          default: 'https://translate.terraprint.co/translate',
          when: (answers) => answers.useApi && answers.translationMethod && answers.translationMethod[0] === 'LibreTranslate'
        },
        {
          type: 'confirm',
          name: 'hasLibreKey',
          message: 'Do you have an API key for this LibreTranslate instance?',
          default: false,
          when: (answers) => answers.useApi && answers.translationMethod && answers.translationMethod[0] === 'LibreTranslate'
        },
        {
          type: 'password',
          name: 'libreApiKey',
          message: 'Enter your LibreTranslate API/Access Key:',
          when: (answers) => answers.hasLibreKey
        },
        {
          type: 'checkbox',
          name: 'switcherPosition',
          message: 'Where to inject the language switcher? (Select strictly ONE using space, then press enter)',
          choices: ['nav', 'header', 'footer', 'div', 'section', 'li', 'span', 'main', 'aside', 'custom', 'floating element (fixed position)', 'skip'],
          validate: (answer) => {
            if (answer.length !== 1) {
              return 'You must select exactly one option.';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'customTag',
          message: 'Enter your custom HTML tag (without brackets, e.g. article, figure):',
          when: (answers) => answers.switcherPosition && answers.switcherPosition[0] === 'custom'
        },
        {
          type: 'checkbox',
          name: 'targetingMethod',
          message: 'How do you want to pinpoint the injection target? (Select strictly ONE using space, then press enter)',
          choices: [
            'By HTML ID (e.g. nav#main-nav)',
            'By file path (e.g. src/components/Navbar.jsx)',
            'No specific target (first matching tag)'
          ],
          when: (answers) => answers.switcherPosition && answers.switcherPosition[0] !== 'skip' && answers.switcherPosition[0] !== 'floating element (fixed position)',
          validate: (answer) => {
            if (answer.length !== 1) {
              return 'You must select exactly one option.';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'targetId',
          message: 'Enter the exact HTML ID of the target element (without the #):',
          when: (answers) => answers.targetingMethod && answers.targetingMethod[0].startsWith('By HTML ID')
        },
        {
          type: 'input',
          name: 'targetFilePath',
          message: 'Enter the relative file path from your project root:\n(e.g. src/components/Navbar.jsx)',
          when: (answers) => answers.targetingMethod && answers.targetingMethod[0].startsWith('By file path')
        },
        {
          type: 'confirm',
          name: 'targetFileById',
          message: 'Do you also want to narrow it down by HTML ID within that file?',
          default: false,
          when: (answers) => answers.targetingMethod && answers.targetingMethod[0].startsWith('By file path')
        },
        {
          type: 'input',
          name: 'targetId',
          message: 'Enter the HTML ID (without the #):',
          when: (answers) => answers.targetFileById
        }
      ]);

      answers = {
        languages: qsAnswers.languages,
        installI18next: true,
        extractText: true,
        useApi: qsAnswers.useApi,
        translationMethod: qsAnswers.translationMethod ? qsAnswers.translationMethod : undefined,
        apiKey: qsAnswers.apiKey,
        libreUrl: qsAnswers.libreUrl,
        hasLibreKey: qsAnswers.hasLibreKey || false,
        libreApiKey: qsAnswers.libreApiKey,
        wantsSwitcher: true,
        switcherPosition: qsAnswers.switcherPosition,
        customTag: qsAnswers.customTag,
        insertMode: ['append'],
        targetingMethod: qsAnswers.targetingMethod,
        targetFilePath: qsAnswers.targetFilePath,
        targetFileById: qsAnswers.targetFileById,
        targetId: qsAnswers.targetId,
        wantsCustomClass: false,
        installLinters: false
      };

      const summaryLines = [
        'Quick Start Configuration Summary',
        '---------------------------------',
        `Languages: ${qsAnswers.languages.join(', ')}`,
        `Auto-translate: ${qsAnswers.useApi}`,
        ...(qsAnswers.useApi && qsAnswers.translationMethod ? [`API Provider: ${qsAnswers.translationMethod[0]}`] : []),
        `Install i18next: true`,
        `Extract Text: true`,
        `Add Switcher: ${qsAnswers.switcherPosition[0] !== 'skip'}`,
        ...(qsAnswers.switcherPosition[0] !== 'skip' ? [`Switcher Position: ${qsAnswers.switcherPosition[0] === 'custom' ? qsAnswers.customTag : qsAnswers.switcherPosition[0]}`] : []),
        `Insert Mode: append`,
        `Target Method: ${qsAnswers.targetingMethod ? qsAnswers.targetingMethod[0] : 'None'}`,
        ...(qsAnswers.targetFilePath ? [`Target File: ${qsAnswers.targetFilePath}`] : []),
        ...(qsAnswers.targetId ? [`Target ID: ${qsAnswers.targetId}`] : []),
        `Custom Class: false`,
        `Install Linters: false`
      ];

      /**
       * Prints a bordered summary box for the applied settings.
       * @param {string[]} lines - Text lines to display in the box.
       */
      const printSummaryBox = (lines) => {
        const width = Math.max(...lines.map(l => l.length)) + 4;
        console.log('┌' + '─'.repeat(width - 2) + '┐');
        lines.forEach(line => {
          console.log('│ ' + line.padEnd(width - 4) + ' │');
        });
        console.log('└' + '─'.repeat(width - 2) + '┘');
      };
      
      console.log('');
      printSummaryBox(summaryLines);
      console.log('');
      console.log('Run `meridian sync` any time to extract and translate new strings.\n');

    } else {
      answers = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'languages',
          message: 'Which languages do you want to support?',
          choices: ['en', 'ar', 'es', 'fr', 'de', 'zh'],
          default: ['en', 'ar']
        },
        {
          type: 'confirm',
          name: 'installI18next',
          message: 'Do you want to install and initialize i18next?',
          default: true
        },
        {
          type: 'confirm',
          name: 'extractText',
          message: 'Do you want to extract text to JSON automatically?',
          default: true,
          when: (answers) => answers.installI18next
        },
        {
          type: 'confirm',
          name: 'useApi',
          message: 'Do you want to use an API to translate the extracted text?',
          default: true,
          when: (answers) => answers.extractText
        },
        {
          type: 'checkbox',
          name: 'translationMethod',
          message: 'Which API provider should we use? (Select strictly ONE using space, then press enter)',
          choices: ['Google API', 'DeepL', 'LibreTranslate', 'Mock (Local Testing)'],
          validate(answer) {
            if (answer.length !== 1) {
              return 'You must select exactly one API provider.';
            }
            return true;
          },
          when: (answers) => answers.useApi
        },
        {
          type: 'password',
          name: 'apiKey',
          message: 'Enter your API Key:',
          when: (answers) => answers.useApi && answers.translationMethod && (answers.translationMethod[0] === 'Google API' || answers.translationMethod[0] === 'DeepL')
        },
        {
          type: 'input',
          name: 'libreUrl',
          message: 'Enter your LibreTranslate endpoint URL:',
          default: 'https://translate.terraprint.co/translate',
          when: (answers) => answers.useApi && answers.translationMethod && answers.translationMethod[0] === 'LibreTranslate'
        },
        {
          type: 'confirm',
          name: 'hasLibreKey',
          message: 'Do you have an API key for this LibreTranslate instance?',
          default: false,
          when: (answers) => answers.useApi && answers.translationMethod && answers.translationMethod[0] === 'LibreTranslate'
        },
        {
          type: 'password',
          name: 'libreApiKey',
          message: 'Enter your LibreTranslate API/Access Key:',
          when: (answers) => answers.hasLibreKey
        },
        {
          type: 'confirm',
          name: 'wantsSwitcher',
          message: 'Do you want to add a language switcher button component?',
          default: true
        },
        {
          type: 'checkbox',
          name: 'switcherPosition',
          message: 'Where to inject the language switcher? (Select strictly ONE using space, then press enter)',
          choices: ['nav', 'header', 'footer', 'div', 'section', 'li', 'span', 'main', 'aside', 'custom', 'floating element (fixed position)', 'skip'],
          when: (answers) => answers.wantsSwitcher,
          validate: (answer) => {
            if (answer.length !== 1) {
              return 'You must select exactly one option.';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'customTag',
          message: 'Enter your custom HTML tag (without brackets, e.g. article, figure):',
          when: (answers) => answers.wantsSwitcher && answers.switcherPosition && answers.switcherPosition[0] === 'custom'
        },
        {
          type: 'checkbox',
          name: 'targetingMethod',
          message: 'How do you want to pinpoint the injection target? (Select strictly ONE using space, then press enter)',
          choices: [
            'By HTML ID (e.g. nav#main-nav)',
            'By file path (e.g. src/components/Navbar.jsx)',
            'No specific target (first matching tag)'
          ],
          when: (answers) => answers.wantsSwitcher && answers.switcherPosition && answers.switcherPosition[0] !== 'skip' && answers.switcherPosition[0] !== 'floating element (fixed position)',
          validate: (answer) => {
            if (answer.length !== 1) {
              return 'You must select exactly one option.';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'targetId',
          message: 'Enter the exact HTML ID of the target element (without the #):',
          when: (answers) => answers.targetingMethod && answers.targetingMethod[0].startsWith('By HTML ID')
        },
        {
          type: 'input',
          name: 'targetFilePath',
          message: 'Enter the relative file path from your project root:\n(e.g. src/components/Navbar.jsx)',
          when: (answers) => answers.targetingMethod && answers.targetingMethod[0].startsWith('By file path')
        },
        {
          type: 'confirm',
          name: 'targetFileById',
          message: 'Do you also want to narrow it down by HTML ID within that file?',
          default: false,
          when: (answers) => answers.targetingMethod && answers.targetingMethod[0].startsWith('By file path')
        },
        {
          type: 'input',
          name: 'targetId',
          message: 'Enter the HTML ID (without the #):',
          when: (answers) => answers.targetFileById
        },
        {
          type: 'checkbox',
          name: 'insertMode',
          message: 'How should the button be inserted into the target element? (Select strictly ONE using space, then press enter)',
          choices: ['Append', 'Prepend'],
          default: ['Append'],
          when: (answers) => answers.wantsSwitcher && answers.switcherPosition && answers.switcherPosition[0] !== 'skip' && answers.switcherPosition[0] !== 'floating element (fixed position)',
          validate: (answer) => {
            if (answer.length !== 1) {
              return 'You must select exactly one option.';
            }
            return true;
          }
        },
        {
          type: 'confirm',
          name: 'wantsCustomClass',
          message: 'Do you want to add a custom CSS class to style the button component itself?',
          default: false,
          when: (answers) => answers.wantsSwitcher
        },
        {
          type: 'input',
          name: 'switcherClass',
          message: 'Enter your custom CSS class name(s):',
          when: (answers) => answers.wantsCustomClass
        },
        {
          type: 'confirm',
          name: 'installLinters',
          message: 'Do you want to install ESLint/Stylelint plugins?',
          default: true
        }
      ]);
    }

    const spinner = createSpinner('Initializing Meridian...').start();
    
    // Simulate work
    await new Promise((r) => setTimeout(r, 1000));
    
    let providerName = 'manual';
    let endpointUrl = '';
    let collectedApiKey = '';

    if (answers.useApi && answers.translationMethod && answers.translationMethod.length > 0) {
      const selected = answers.translationMethod[0];
      if (selected === 'Google API') {
        providerName = 'google';
        collectedApiKey = answers.apiKey;
      } else if (selected === 'DeepL') {
        providerName = 'deepl';
        collectedApiKey = answers.apiKey;
      } else if (selected === 'LibreTranslate') {
        providerName = 'libre';
        endpointUrl = answers.libreUrl || 'https://translate.terraprint.co/translate';
        if (answers.hasLibreKey) {
          collectedApiKey = answers.libreApiKey;
        }
      } else if (selected === 'Mock (Local Testing)') {
        providerName = 'mock';
      }
    }

    /**
     * Resolves the targeting parameters based on user answers.
     * @param {Object} ans - The prompt answers.
     * @returns {Object} The resolved id and filePath.
     */
    function resolveTargeting(ans) {
      const method = ans.targetingMethod ? ans.targetingMethod[0] : null;
      if (method && method.startsWith('By HTML ID')) {
        return { id: ans.targetId, filePath: undefined };
      } else if (method && method.startsWith('By file path')) {
        return { filePath: ans.targetFilePath, id: ans.targetFileById ? ans.targetId : undefined };
      }
      return { id: undefined, filePath: undefined };
    }

    const configData = {
      version: '1.0',
      languages: answers.languages,
      defaultLanguage: 'en',
      i18next: answers.installI18next,
      extractText: answers.extractText || false,
      translation: answers.extractText && answers.useApi ? {
        provider: providerName,
        fallback: 'manual',
        ...(endpointUrl && { endpointUrl })
      } : false,
      languageSwitcher: answers.wantsSwitcher && answers.switcherPosition && answers.switcherPosition[0] !== 'skip' ? {
        position: {
          tag: answers.switcherPosition[0] === 'floating element (fixed position)' ? undefined : (answers.switcherPosition[0] === 'custom' ? answers.customTag : answers.switcherPosition[0]),
          floating: answers.switcherPosition[0] === 'floating element (fixed position)',
          ...resolveTargeting(answers),
          insertMode: answers.insertMode && answers.insertMode[0] ? answers.insertMode[0].toLowerCase() : 'append'
        },
        customClass: answers.wantsCustomClass ? answers.switcherClass : '',
        showFlags: true
      } : false,
      linters: answers.installLinters
    };

    saveConfig(process.cwd(), configData);
    
    let keySavedMsg = '';
    if (collectedApiKey) {
      const envPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        fs.appendFileSync(envPath, `\nMERIDIAN_API_KEY=${collectedApiKey}\n`);
      } else {
        fs.writeFileSync(envPath, `MERIDIAN_API_KEY=${collectedApiKey}\n`);
      }
      
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        if (!gitignoreContent.includes('.env')) {
          fs.appendFileSync(gitignorePath, '\n.env\n');
        }
      }
      keySavedMsg = chalk.green('\n   ✓ API key safely stored in .env and ignored in Git.');
    }

    spinner.success({ text: 'Initialization complete!' });
    if (keySavedMsg) console.log(keySavedMsg);
    
    // Execute Modifications
    await runModifications(process.cwd(), configData);
  });

program
  .command('sync [languages...]')
  .description('Sync newly added or changed strings from data files to the translation pipeline')
  .option('-f, --force', 'Force writing changes even if array reordering warning is triggered')
  .action(async (cliLanguages, options) => {
    const configPath = path.join(process.cwd(), '.meridianrc.json');
    if (!fs.existsSync(configPath)) {
      console.log(chalk.red('❌ Error: .meridianrc.json not found. Run `meridian init` first.'));
      process.exit(1);
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const spinner = createSpinner('Syncing data files...').start();
      await runSync(process.cwd(), config, spinner, cliLanguages, options.force);
    } catch (err) {
      console.log(chalk.red(`\n❌ Error running sync: ${err.message}`));
    }
  });

program
  .command('translate [languages...]')
  .description('Sync and translate new strings found in your en/translation.json file')
  .action(async (cliLanguages) => {
    const configPath = path.join(process.cwd(), '.meridianrc.json');
    if (!fs.existsSync(configPath)) {
      console.log(chalk.red('❌ Error: .meridianrc.json not found. Run meridian init first.'));
      return;
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (!config.translation) {
        console.log(chalk.yellow('⚠️  Translation is disabled or not configured in .meridianrc.json.'));
        return;
      }
      
      if (cliLanguages && cliLanguages.length > 0) {
        const newLangs = cliLanguages.filter(lang => !config.languages.includes(lang) && lang !== config.defaultLanguage);
        if (newLangs.length > 0) {
          config.languages.push(...newLangs);
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
          console.log(chalk.green(`✓ Added new target language(s) to configuration: ${newLangs.join(', ')}`));
          
          if (config.i18next) {
              const i18nPath = path.join(process.cwd(), 'src', 'i18n.js');
              if (fs.existsSync(i18nPath)) {
                  let i18nContent = fs.readFileSync(i18nPath, 'utf8');
                  const supportedLngsRegex = /supportedLngs:\s*\[.*?\]/;
                  if (supportedLngsRegex.test(i18nContent)) {
                      i18nContent = i18nContent.replace(supportedLngsRegex, `supportedLngs: ${JSON.stringify(config.languages)}`);
                      fs.writeFileSync(i18nPath, i18nContent, 'utf8');
                      console.log(chalk.green(`✓ Updated supportedLngs inside src/i18n.js to include new languages.`));
                  }
              }
          }
          
          if (config.languageSwitcher) {
              const { updateToggle } = await inquirer.prompt([{
                  type: 'confirm',
                  name: 'updateToggle',
                  message: 'Do you want to regenerate your LanguageToggle component to include the new languages? (Warning: This will overwrite customizations)',
                  default: true
              }]);
              
              if (updateToggle) {
                  let foundPath = null;
                  const searchPaths = [
                      'src/components/LanguageToggle.jsx', 
                      'app/components/LanguageToggle.jsx', 
                      'components/LanguageToggle.jsx',
                      'src/LanguageToggle.jsx'
                  ];
                  for (const sp of searchPaths) {
                      const full = path.join(process.cwd(), sp);
                      if (fs.existsSync(full)) {
                          foundPath = full;
                          break;
                      }
                  }
                  
                  if (foundPath) {
                      fs.writeFileSync(foundPath, getToggleTemplate(config.languages), 'utf8');
                      console.log(chalk.green(`✓ Regenerated Language Toggle at ${path.relative(process.cwd(), foundPath)}`));
                  } else {
                      console.log(chalk.yellow(`⚠️ LanguageToggle.jsx not found in standard paths. You may need to update the options list manually.`));
                  }
              }
          }
        }
      }

      const spinner = createSpinner('Starting translation pipeline...').start();
      await runTranslations(process.cwd(), config, spinner, cliLanguages);
      spinner.success({ text: 'Translation pipeline finished!' });
    } catch (err) {
      console.log(chalk.red(`❌ Error running translations: ${err.message}`));
    }
  });

program
  .command('add-button')
  .description('Injects the frontend structural language toggle')
  .option('-p, --position <position>', 'Where to inject (e.g., nav, header, floating, custom)')
  .option('--tag <tag>', 'Custom HTML tag if position is custom')
  .option('--id <id>', 'Target element HTML ID')
  .option('--file <file>', 'Target file path')
  .option('--mode <mode>', 'Insert mode: append or prepend', 'append')
  .option('--class <className>', 'Custom CSS class for the toggle')
  .action(async (options) => {
    const configPath = path.join(process.cwd(), '.meridianrc.json');
    if (!fs.existsSync(configPath)) {
      console.log(chalk.red('❌ Error: .meridianrc.json not found. Run `meridian init` first.'));
      process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    if (!options.position && !options.file) {
      console.log(chalk.yellow('⚠️  Please provide a --position (e.g., nav) or --file path (e.g., src/components/Header.jsx)'));
      process.exit(1);
    }

    config.languageSwitcher = {
        position: {
            tag: options.position === 'floating' ? undefined : (options.position === 'custom' ? options.tag : options.position),
            floating: options.position === 'floating',
            id: options.id,
            filePath: options.file,
            insertMode: options.mode.toLowerCase()
        },
        customClass: options.class || '',
        showFlags: true
    };

    saveConfig(process.cwd(), config);
    console.log(chalk.green('✓ Configuration updated for Language Switcher.'));

    const runConfig = { ...config, translation: false, i18next: false, extractText: false };

    await runModifications(process.cwd(), runConfig);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
