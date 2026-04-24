import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import babel from '@babel/core';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { scanDataFiles } from './scanDataFiles.js';
import { runTranslations } from './translator-runner.js';

function getAstPath(pathNode) {
  const parts = [];
  let current = pathNode;
  
  while (current && !current.isProgram()) {
    if (current.isObjectProperty()) {
      const key = current.node.key;
      const keyName = key.type === 'Identifier' ? key.name : key.value;
      if (keyName !== undefined) parts.unshift(keyName);
    } else if (current.parentPath && current.parentPath.isArrayExpression()) {
      parts.unshift(current.key);
    } else if (current.isVariableDeclarator()) {
      parts.unshift(current.node.id.name);
    }
    current = current.parentPath;
  }
  return parts.join('.');
}

function walkJson(obj, currentPath, translatableKeys, result) {
  if (typeof obj === 'string') {
    const key = currentPath[currentPath.length - 1];
    if (translatableKeys.includes(key)) {
      result[currentPath.join('.')] = obj;
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => walkJson(item, [...currentPath, index], translatableKeys, result));
  } else if (obj && typeof obj === 'object') {
    Object.entries(obj).forEach(([key, value]) => walkJson(value, [...currentPath, key], translatableKeys, result));
  }
}

async function extractStringsFromJs(filePath, translatableKeys) {
  const code = await fs.readFile(filePath, 'utf8');
  const result = {};
  try {
    const ast = babel.parse(code, {
      filename: filePath,
      sourceType: 'module',
      parserOpts: { plugins: ['jsx', 'typescript'] }
    });

    babel.traverse(ast, {
      StringLiteral(p) {
        const objProp = p.findParent(parent => parent.isObjectProperty());
        if (objProp) {
          const keyNode = objProp.node.key;
          const keyName = keyNode.type === 'Identifier' ? keyNode.name : keyNode.value;
          if (translatableKeys.includes(keyName)) {
            const astPath = getAstPath(p);
            if (astPath) result[astPath] = p.node.value;
          }
        }
      },
      TemplateLiteral(p) {
        if (p.node.expressions.length > 0) return;
        const objProp = p.findParent(parent => parent.isObjectProperty());
        if (objProp) {
          const keyNode = objProp.node.key;
          const keyName = keyNode.type === 'Identifier' ? keyNode.name : keyNode.value;
          if (translatableKeys.includes(keyName)) {
            const astPath = getAstPath(p);
            if (astPath) result[astPath] = p.node.quasis[0].value.raw;
          }
        }
      }
    });
  } catch (err) {
    // Ignore parse errors here, as scanDataFiles already logs them
  }
  return result;
}

export async function runSync(projectRoot, config, spinner, cliLanguages, force = false) {
  const registry = await scanDataFiles(projectRoot);
  const defaultLang = config.defaultLanguage || 'en';
  const translationPath = path.join(projectRoot, 'public', 'locales', defaultLang, 'translation.json');

  let existingTranslations = {};
  if (existsSync(translationPath)) {
    try {
      existingTranslations = JSON.parse(await fs.readFile(translationPath, 'utf8'));
    } catch (e) {
      spinner.fail({ text: 'Failed to parse en/translation.json' });
      return;
    }
  }

  // Ensure _data exists
  if (!existingTranslations._data) existingTranslations._data = {};

  const extractedStrings = {};
  const fileKeysMap = {}; // Maps file paths to the keys extracted from them

  for (const [relPath, fileInfo] of Object.entries(registry)) {
    if (!fileInfo.translatable || fileInfo.translatable.length === 0) continue;
    
    const absolutePath = path.join(projectRoot, relPath);
    const fileBaseName = path.basename(absolutePath, path.extname(absolutePath)).replace(/[^a-zA-Z0-9]/g, '_');
    
    let fileResult = {};
    if (absolutePath.endsWith('.js')) {
      fileResult = await extractStringsFromJs(absolutePath, fileInfo.translatable);
    } else if (absolutePath.endsWith('.json')) {
      try {
        const code = await fs.readFile(absolutePath, 'utf8');
        const data = JSON.parse(code);
        walkJson(data, [], fileInfo.translatable, fileResult);
      } catch (e) {
        // skip
      }
    }

    fileKeysMap[relPath] = [];

    for (const [astPath, value] of Object.entries(fileResult)) {
      if (value.startsWith('_data.')) continue;
      
      const fullKey = `_data.${fileBaseName}.${astPath}`;
      extractedStrings[fullKey] = value;
      fileKeysMap[relPath].push(fullKey);
    }
  }

  let newCount = 0;
  let updatedCount = 0;
  let deprecatedCount = 0;
  const deltaKeys = [];

  // Track existing keys belonging to files
  const existingDataKeys = new Set(
    Object.keys(existingTranslations).filter(k => k.startsWith('_data.'))
  );

  // Check for > 50% change edge case per file
  let requiresForceWarning = false;
  for (const [relPath, keys] of Object.entries(fileKeysMap)) {
    let fileChangedCount = 0;
    const fileBaseName = path.basename(relPath, path.extname(relPath)).replace(/[^a-zA-Z0-9]/g, '_');
    const prefix = `_data.${fileBaseName}.`;
    
    const fileExistingKeys = Array.from(existingDataKeys).filter(k => k.startsWith(prefix));
    
    for (const key of keys) {
      // Check if it's a change or new
      const dotPathParts = key.split('.');
      dotPathParts.shift(); // remove '_data'
      
      // Navigate to value in existingTranslations
      let current = existingTranslations._data;
      for (const part of dotPathParts) {
        if (current === undefined) break;
        current = current[part];
      }
      
      if (current !== undefined && current !== extractedStrings[key]) {
        fileChangedCount++;
      }
    }
    
    if (fileExistingKeys.length > 0 && fileChangedCount > (fileExistingKeys.length / 2)) {
      requiresForceWarning = true;
    }
  }

  if (requiresForceWarning && !force) {
    spinner.stop();
    console.log(chalk.yellow(`\n⚠ Warning: More than 50% of the keys in a data file have changed values.`));
    console.log(chalk.yellow(`This might indicate an array reordering rather than text changes.`));
    console.log(chalk.yellow(`Running this could cause a mass re-translation. If you are sure, run with --force`));
    
    const { confirmForce } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirmForce',
      message: 'Do you want to proceed and overwrite the translations anyway?',
      default: false
    }]);

    if (!confirmForce) {
      console.log(chalk.red('Sync aborted.'));
      return;
    }
    spinner.start({ text: 'Continuing sync...' });
  }

  // Set values into existingTranslations
  const setValue = (obj, keyPath, value) => {
    const parts = keyPath.split('.');
    parts.shift(); // remove _data since we operate inside existingTranslations._data
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    
    const leaf = parts[parts.length - 1];
    
    if (current[leaf] !== undefined) {
      // Check if value changed
      if (typeof current[leaf] === 'object' && current[leaf]._deprecated) {
        // Was deprecated, now restored/new
        current[leaf] = value;
        newCount++;
        deltaKeys.push(keyPath);
      } else if (current[leaf] !== value) {
        current[leaf] = value;
        updatedCount++;
        deltaKeys.push(keyPath);
      }
    } else {
      current[leaf] = value;
      newCount++;
      deltaKeys.push(keyPath);
    }
  };

  // Diffing logic
  for (const [key, value] of Object.entries(extractedStrings)) {
    setValue(existingTranslations._data, key, value);
    existingDataKeys.delete(key);
  }

  // Deprecate keys that no longer exist
  for (const missingKey of existingDataKeys) {
    const parts = missingKey.split('.');
    parts.shift();
    let current = existingTranslations._data;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) break;
      current = current[parts[i]];
    }
    if (current && current[parts[parts.length - 1]]) {
      if (typeof current[parts[parts.length - 1]] === 'string') {
        current[parts[parts.length - 1]] = {
          _deprecated: true,
          value: current[parts[parts.length - 1]]
        };
        deprecatedCount++;
      }
    }
  }

  if (newCount === 0 && updatedCount === 0 && deprecatedCount === 0) {
    spinner.success({ text: 'Nothing to sync. All strings are up to date.' });
    return;
  }

  await fs.writeFile(translationPath, JSON.stringify(existingTranslations, null, 2), 'utf8');

  spinner.success({ text: 'Sync extraction complete.' });
  
  console.log();
  if (newCount > 0) console.log(chalk.green(`  ✓ ${newCount} new strings extracted`));
  if (updatedCount > 0) console.log(chalk.blue(`  ✓ ${updatedCount} strings updated`));
  if (deprecatedCount > 0) console.log(chalk.yellow(`  ⚠ ${deprecatedCount} deprecated strings flagged (review en/translation.json)`));

  if (deltaKeys.length > 0) {
    await runTranslations(projectRoot, config, spinner, cliLanguages, deltaKeys);
  }
}
