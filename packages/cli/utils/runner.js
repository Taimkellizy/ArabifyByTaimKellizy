import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { analyzeCSS, analyzeJSX, contextTemplate, toggleTemplate } from '@meridian/core';

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

  // 1. Git Safety Check
  try {
    // Check if git is initialized
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore', cwd });
    
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

  // 2. Find targeting files. Let's scan specific subdirectories to avoid modifying core configs.
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
         const result = await analyzeJSX(content, {}, { isMainFile: true, isReact: true, mode: 'fix-all', isAppFile, config });
         
         // In phase 6 we'll connect the exact inject variables here if analyzeJSX changes
         if (result.fixedCode && result.fixedCode !== content) {
            fs.writeFileSync(fullPath, result.fixedCode, 'utf8');
            fixedJsxCount++;
            console.log(chalk.green(`  Fixed JSX: ${relativePath}`));
         }
      }
    } catch (err) {
      // console.log(chalk.red(`❌ Failed to parse: ${relativePath} - ${err.message}`));
      // We will suppress heavy error logs during scanning unless requested
    }
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
            fs.writeFileSync(contextPath, contextTemplate, 'utf8');
            console.log(chalk.green(`  Created: ${path.relative(cwd, contextPath)}`));
        }

        if (config.languageSwitcher) {
            const tempBaseSrc = baseSrcDir;
            const compDir = path.join(tempBaseSrc, 'components');
            if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true });
            
            const togglePath = path.join(compDir, 'LanguageToggle.jsx');
            if (!fs.existsSync(togglePath)) {
                 fs.writeFileSync(togglePath, toggleTemplate, 'utf8');
                 console.log(chalk.green(`  Created: ${path.relative(cwd, togglePath)}`));
            }
        }
        
         const utilsDir = path.join(baseSrcDir, 'utils');
         if (!fs.existsSync(utilsDir)) fs.mkdirSync(utilsDir, { recursive: true });
         const contentPath = path.join(utilsDir, 'content.js');
         if (!fs.existsSync(contentPath)) {
            // Need a dummy dictionary so the app doesn't crash on boot before manual trans
            const dummyDict = `export const content = {
  en: { title: "Hello World", welcome: "Welcome" },
  ar: { title: "مرحبا بالعالم", welcome: "أهلا بك" }
};`;
             fs.writeFileSync(contentPath, dummyDict, 'utf8');
             console.log(chalk.green(`  Created: ${path.relative(cwd, contentPath)}`));
         }
      }
  }

  console.log(chalk.green(`\n✅ Modification complete:`));
  console.log(chalk.green(`   - Fixed ${fixedCssCount} CSS files`));
  console.log(chalk.green(`   - Fixed ${fixedJsxCount} JS/JSX files\n`));
  console.log(chalk.magenta(`To undo these changes at any time, run: `) + chalk.white.bold(`git checkout .\n`));
}
