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
    
    let answers = await inquirer.prompt([
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
        choices: ['nav', 'header', 'footer', 'ul', 'li', 'a', 'custom selector', 'skip'],
        validate(answer) {
          if (answer.length !== 1) {
            return 'You must select exactly one position.';
          }
          return true;
        },
        when: (answers) => answers.wantsSwitcher
      },
      {
        type: 'confirm',
        name: 'wantsCustomClass',
        message: 'Do you want to add a custom CSS class to the button?',
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
      languageSwitcher: answers.wantsSwitcher ? {
        position: answers.switcherPosition[0],
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
  .command('translate')
  .description('Sync and translate new strings found in your en/translation.json file')
  .action(async () => {
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
      
      const spinner = createSpinner('Starting translation pipeline...').start();
      await runTranslations(process.cwd(), config, spinner);
      spinner.success({ text: 'Translation pipeline finished!' });
    } catch (err) {
      console.log(chalk.red(`❌ Error running translations: ${err.message}`));
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
