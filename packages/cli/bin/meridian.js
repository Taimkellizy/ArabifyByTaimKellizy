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
        choices: ['Google API', 'DeepL', 'Lebra', 'Other'],
        validate(answer) {
          if (answer.length !== 1) {
            return 'You must select exactly one API provider.';
          }
          return true;
        },
        when: (answers) => answers.useApi
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
    
    const configData = {
      version: '1.0',
      languages: answers.languages,
      defaultLanguage: 'en',
      i18next: answers.installI18next,
      extractText: answers.extractText || false,
      translation: answers.extractText ? {
        provider: answers.useApi ? (answers.translationMethod[0] === 'Google API' ? 'google' : answers.translationMethod[0].toLowerCase()) : 'manual',
        fallback: 'manual'
      } : false,
      languageSwitcher: answers.wantsSwitcher ? {
        position: answers.switcherPosition[0],
        customClass: answers.wantsCustomClass ? answers.switcherClass : '',
        showFlags: true
      } : false,
      linters: answers.installLinters
    };

    saveConfig(process.cwd(), configData);
    
    spinner.success({ text: 'Initialization complete!' });
    
    // Execute Modifications
    await runModifications(process.cwd(), configData);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
