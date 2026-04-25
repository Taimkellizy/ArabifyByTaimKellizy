import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { analyzeCSS, analyzeJSX, extractAndTransformJSX, getContextTemplate, getI18nContextTemplate, getToggleTemplate } from '@meridian/core';
import { installI18nDependencies } from './installer.js';
import { generateI18nConfig } from '../templates/i18n-generator.js';
import { injectI18nImport } from './ast-injector.js';
import { runTranslations } from './translator-runner.js';
import { scanDataFiles, promoteDataFileKeys } from './scanDataFiles.js';

// Helper to recursively find files
function walkFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // Ignore common non-source directories
      if (!['node_modules', '.git', 'build', 'dist', '.next'].includes(file)) {
        fileList = walkFiles(fullPath, fileList);
      }
    } else {
      if (['.js', '.jsx', '.ts', '.tsx', '.css'].includes(path.extname(fullPath))) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

export async function runModifications(cwd, config) {
  console.log(chalk.blue('\n🔍 Scanning project files for RTL issues...'));

  let isGitRepo = false;
  // 1. Git Safety Check
  try {
    // Check if git is initialized
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore', cwd });
    isGitRepo = true;
    
    // Check for uncommitted changes
    const status = execSync('git status --porcelain', { cwd }).toString();
    if (status.length > 0) {
      console.log(chalk.red('\n⚠️  CRITICAL: You have uncommitted Git changes.'));
      const { proceed } = await inquirer.prompt([{
        type: 'confirm',
        name: 'proceed',
        message: 'It is highly recommended to commit before running Meridian so you can undo changes if needed. Do you want to continue anyway?',
        default: false
      }]);
      
      if (!proceed) {
        console.log(chalk.yellow('Operation cancelled. Please commit your changes and run `meridian init` again.'));
        process.exit(0);
      }
    }
  } catch (error) {
    console.log(chalk.red('\n⚠️  CRITICAL: Not a Git repository. Meridian will overwrite files permanently without an undo option.'));
    const { proceed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'proceed',
      message: 'Do you want to continue anyway without a Git repository undo option?',
      default: false
    }]);
    
    if (!proceed) {
      console.log(chalk.yellow('Operation cancelled. Please run `git init` and try again.'));
      process.exit(0);
    }
  }

  // 2. Initial Setup (i18next)
  if (config.i18next) {
    console.log(chalk.blue('\n📦 Setting up i18next...'));
    try {
      console.log(chalk.gray('  Installing dependencies (this may take a minute)...'));
      await installI18nDependencies(cwd);
      console.log(chalk.green('  ✓ Dependencies installed.'));

      console.log(chalk.gray('  Generating i18n configurations...'));
      await generateI18nConfig(cwd, config.languages);
      console.log(chalk.green('  ✓ i18n.js configuration created.'));

      console.log(chalk.gray('  Injecting i18n into entry point...'));
      const injectionWarn = await injectI18nImport(cwd);
      if (injectionWarn) {
        console.log(chalk.yellow(`  ⚠️  ${injectionWarn}`));
      } else {
        console.log(chalk.green('  ✓ i18n imported successfully into entry point.'));
      }
    } catch (err) {
      console.log(chalk.red(`  ❌ Error during i18next setup: ${err.message}`));
    }
  }

  // 3. Find targeting files. Let's scan specific subdirectories to avoid modifying core configs.
  let targetFiles = [];
  const dirsToScan = ['src', 'app', 'pages', 'components'];
  let foundTarget = false;
  
  for (const dir of dirsToScan) {
    const absolutePath = path.join(cwd, dir);
    if (fs.existsSync(absolutePath)) {
      foundTarget = true;
      targetFiles = walkFiles(absolutePath, targetFiles);
    }
  }
  
  if (!foundTarget) {
      console.log(chalk.gray(`Warning: Standard source directories not found. Falling back to specific root scans...`));
      // Scan root, but explicitly ignore lots to avoid touching configs
      targetFiles = walkFiles(cwd).filter(file => {
          return !file.includes('node_modules') 
              && !file.includes('.git')
              && !file.includes('packages') // Safety for monorepo development
              && !file.includes('config')
      });
  }

  if (targetFiles.length === 0) {
    console.log(chalk.yellow('No target files found to analyze.'));
    return;
  }

  console.log(chalk.gray(`Found ${targetFiles.length} files. Applying fixes...`));

  let fixedCssCount = 0;
  let fixedJsxCount = 0;
  let allExtractedStrings = {};
  let wasSwitcherInjected = false;

  /**
   * Phase 3 – Data File Scanner.
   * Discovers JS/JSON data files under src/ and classifies their string leaves.
   * Failures are non-fatal: a warning is printed and the registry stays empty.
   * @type {Object}
   */
  let dataRegistry = {};
  let dataFilesScanned = 0;
  console.log(chalk.blue('\n📂 Scanning data files...'));
  try {
    dataRegistry = await scanDataFiles(cwd);
    dataFilesScanned = Object.keys(dataRegistry).length;
    if (dataFilesScanned > 0) {
      console.log(chalk.green(`  ✓ Found ${dataFilesScanned} data file(s).`));
    } else {
      console.log(chalk.gray('  No data files found (src/data, src/content, src/constants).'));
    }
  } catch (err) {
    console.log(chalk.yellow(`  ⚠️  Data file scan failed and will be skipped: ${err.message}`));
  }

  /**
   * Phase 4 – Key Promotion.
   * For each file found by the scanner, promote translatable strings into the
   * shared translations object using the _data.<baseName>.<dotPath> key scheme.
   * Promotion is idempotent — existing keys are never overwritten.
   * @type {number}
   */
  let dataKeysPromoted = 0;
  if (dataFilesScanned > 0 && (config.i18next || config.translation)) {
    console.log(chalk.blue('\n🔑 Promoting data file keys...'));
    try {
      for (const [relPath, fileRegistry] of Object.entries(dataRegistry)) {
        const absoluteFilePath = path.join(cwd, relPath);
        const promoted = await promoteDataFileKeys(
          absoluteFilePath,
          cwd,
          fileRegistry,
          allExtractedStrings
        );
        dataKeysPromoted += promoted;
      }
      if (dataKeysPromoted > 0) {
        console.log(chalk.green(`  ✓ Promoted ${dataKeysPromoted} new data key(s).`));
      } else {
        console.log(chalk.gray('  All data keys already present — nothing to promote.'));
      }
    } catch (err) {
      console.log(chalk.yellow(`  ⚠️  Key promotion failed and will be skipped: ${err.message}`));
    }
  }

  // 3. Process files
  for (const fullPath of targetFiles) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const ext = path.extname(fullPath);
    const relativePath = path.relative(cwd, fullPath);

    try {
      if (ext === '.css') {
        const result = await analyzeCSS(content, {}, { isMainFile: true });
        if (result.fixedCSS && result.fixedCSS !== content) {
          fs.writeFileSync(fullPath, result.fixedCSS, 'utf8');
          fixedCssCount++;
          console.log(chalk.green(`  Fixed CSS: ${relativePath}`));
        }
      } else if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
         
         const isAppFile = ['App.js', 'App.jsx', 'App.ts', 'App.tsx', '_app.js', '_app.jsx', 'main.tsx', 'main.jsx', 'index.js', 'index.jsx'].some(name => relativePath.endsWith(name));
         /**
          * Phase 5 – Babel JSX Extractor.
          * The scanner registry is forwarded so that shouldWrapMemberExpression()
          * can correctly gate member-expression wrapping by consulting the
          * data-file registry.
          */
         const result = await analyzeJSX(content, {}, { isMainFile: true, isReact: true, mode: 'fix-all', isAppFile, config, fileName: relativePath, dataRegistry });
         if (result.injected) wasSwitcherInjected = true;
         
         let finalCode = result.fixedCode || content;
         let isModified = finalCode !== content;

         if (config.i18next || config.translation) {
             const extraction = extractAndTransformJSX(finalCode, { fileName: relativePath, registry: dataRegistry });
             if (extraction.modifiedCode !== finalCode) {
                 finalCode = extraction.modifiedCode;
                 isModified = true;
             }
             if (extraction.extractedStrings && extraction.extractedStrings.size > 0) {
                 extraction.extractedStrings.forEach((val, key) => {
                     allExtractedStrings[key] = val;
                 });
             }
         }
         
         if (isModified) {
            fs.writeFileSync(fullPath, finalCode, 'utf8');
            fixedJsxCount++;
            console.log(chalk.green(`  Fixed JSX: ${relativePath}`));
         }
      }
    } catch (err) {
      // console.log(chalk.red(`❌ Failed to parse: ${relativePath} - ${err.message}`));
      // We will suppress heavy error logs during scanning unless requested
    }
  }

  // Write Translations JSON
  if (Object.keys(allExtractedStrings).length > 0) {
      const defaultLanguage = config.defaultLanguage || 'en';
      const localesFolder = path.join(cwd, 'public', 'locales', defaultLanguage);
      if (!fs.existsSync(localesFolder)) {
          fs.mkdirSync(localesFolder, { recursive: true });
      }
      
      const sortedKeys = Object.keys(allExtractedStrings).sort();
      const sortedStrings = {};
      sortedKeys.forEach(key => {
          sortedStrings[key] = allExtractedStrings[key];
      });

      const translationPath = path.join(localesFolder, 'translation.json');
      fs.writeFileSync(translationPath, JSON.stringify(sortedStrings, null, 2), 'utf8');
      console.log(chalk.green(`  Created: ${path.relative(cwd, translationPath)}`));
  }

  // 4. Create Support Files (Context & Toggle) if they don't exist
  // We explicitly search for the first valid project sub-folder matched instead of generating at root.
  if (config.languageSwitcher || config.translation) {
      if (dirsToScan.length > 0 && targetFiles.length > 0) {
        let baseSrcDir = cwd;
        const validRootSrc = targetFiles[0].split(path.sep).find(p => ['src', 'app', 'pages', 'components'].includes(p));
        if (validRootSrc) {
            baseSrcDir = targetFiles[0].substring(0, targetFiles[0].indexOf(validRootSrc)) + validRootSrc;
        } else {
            baseSrcDir = path.join(cwd, 'src');
        }
        
        const contextDir = path.join(baseSrcDir, 'contexts');
        if (!fs.existsSync(contextDir)) fs.mkdirSync(contextDir, { recursive: true });
        
        const contextPath = path.join(contextDir, 'LanguageContext.jsx');
        if (!fs.existsSync(contextPath)) {
            const templateToUse = config.i18next ? getI18nContextTemplate(config.languages, config.defaultLanguage) : getContextTemplate(config.languages, config.defaultLanguage);
            fs.writeFileSync(contextPath, templateToUse, 'utf8');
            console.log(chalk.green(`  Created: ${path.relative(cwd, contextPath)}`));
        }

        if (config.languageSwitcher) {
            const tempBaseSrc = baseSrcDir;
            const compDir = path.join(tempBaseSrc, 'components');
            if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true });
            
            const togglePath = path.join(compDir, 'LanguageToggle.jsx');
            if (!fs.existsSync(togglePath)) {
                 const generatedToggleTemplate = getToggleTemplate(config.languages);
                 fs.writeFileSync(togglePath, generatedToggleTemplate, 'utf8');
                 console.log(chalk.green(`  Created: ${path.relative(cwd, togglePath)}`));
            }
        }
        
         if (!config.i18next) {
           const utilsDir = path.join(baseSrcDir, 'utils');
           if (!fs.existsSync(utilsDir)) fs.mkdirSync(utilsDir, { recursive: true });
           const contentPath = path.join(utilsDir, 'content.js');
           if (!fs.existsSync(contentPath)) {
              // Need a dummy dictionary so the app doesn't crash on boot before manual trans
              const dummyEntries = config.languages.map(lang => {
                  if (lang === (config.defaultLanguage || 'en')) return `    ${lang}: { title: "Hello World", welcome: "Welcome" }`;
                  return `    ${lang}: { title: "Title placeholder", welcome: "Welcome placeholder" }`;
              }).join(',\\n');
              
              const dummyDict = `export const content = {
${dummyEntries}
  };`;
               fs.writeFileSync(contentPath, dummyDict, 'utf8');
               console.log(chalk.green(`  Created: ${path.relative(cwd, contentPath)}`));
           }
         }
      }
  }

  console.log(chalk.green(`\n✅ Modification complete:`));
  console.log(chalk.green(`   - Fixed ${fixedCssCount} CSS files`));
  console.log(chalk.green(`   - Fixed ${fixedJsxCount} JS/JSX files`));
  console.log(chalk.green(`   - Data files scanned: ${dataFilesScanned}`));
  console.log(chalk.green(`   - Data keys promoted: ${dataKeysPromoted}\n`));
  
  if (isGitRepo) {
      console.log(chalk.magenta(`To undo these changes at any time, run: `) + chalk.white.bold(`git checkout .\n`));
  }

  if (config.languageSwitcher && config.languageSwitcher.position && config.languageSwitcher.position.tag !== 'skip' && !wasSwitcherInjected) {
      console.log(chalk.yellow(`⚠️  Warning: Could not automatically inject the Language Switcher.`));
      console.log(chalk.yellow(`   Please check your file path or HTML ID targeting options, or manually add <LanguageToggle />\n`));
  }

  // 5. Automatic Translation Step
  if (config.translation) {
    await runTranslations(cwd, config);
  }
}
