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
    console.log(chalk.cyan(figlet.textSync('MERIDIAN', { font: 'Standard', horizontalLayout: 'full' })));
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
        name: 'wantsTranslation',
        message: 'Do you want to extract and translate your project text automatically?',
        default: true
      },
      {
        type: 'list',
        name: 'translationMethod',
        message: 'Which translation provider should we use?',
        choices: ["Google's API", 'DeepL', 'Manual', 'Skip'],
        when: (answers) => answers.wantsTranslation
      },
      {
        type: 'confirm',
        name: 'wantsSwitcher',
        message: 'Do you want to add a language switcher button component?',
        default: true
      },
      {
        type: 'list',
        name: 'switcherPosition',
        message: 'Where to place the language switcher?',
        choices: ['nav', 'header', 'footer', 'ul', 'li', 'a', 'custom selector'],
        when: (answers) => answers.wantsSwitcher
      },
      {
        type: 'confirm',
        name: 'wantsCustomClass',
        message: 'Do you want to add a custom CSS class for styling your button?',
        default: false,
        when: (answers) => answers.wantsSwitcher
      },
      {
        type: 'input',
        name: 'switcherClass',
        message: 'Enter your custom CSS class name(s):',
        when: (answers) => answers.wantsCustomClass
      }
    ]);

    const spinner = createSpinner('Initializing Meridian...').start();
    
    // Simulate work
    await new Promise((r) => setTimeout(r, 1000));
    
    const configData = {
      version: '1.0',
      languages: answers.languages,
      defaultLanguage: 'en',
      translation: answers.wantsTranslation ? {
        provider: answers.translationMethod === "Google's API" ? 'google' : answers.translationMethod.toLowerCase(),
        fallback: 'manual'
      } : false,
      languageSwitcher: answers.wantsSwitcher ? {
        position: answers.switcherPosition,
        customClass: answers.wantsCustomClass ? answers.switcherClass : '',
        showFlags: true
      } : false
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
