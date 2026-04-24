import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import babel from '@babel/core';
import chalk from 'chalk';

/**
 * Classifies a string value based on heuristic rules.
 * @param {string} value - The string to classify.
 * @returns {string} - The classification: 'skip', 'translatable', or 'identifier'.
 */
function classifyString(value) {
  if (value === '' || value.trim() === '') return 'skip';
  if (!isNaN(Number(value))) return 'skip';
  if (value === 'true' || value === 'false') return 'skip';
  
  if (value.includes(' ')) return 'translatable';
  
  const isAllLowercase = value.toLowerCase() === value;
  if (value.includes('-') || value.includes('_') || isAllLowercase) {
    return 'identifier';
  }
  
  return 'identifier';
}

/**
 * Recursively retrieves all files in a directory.
 * @param {string} dir - Directory to scan.
 * @param {string[]} [fileList] - Accumulated list of files.
 * @returns {Promise<string[]>} - List of absolute file paths.
 */
async function getAllFiles(dir, fileList = []) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        await getAllFiles(fullPath, fileList);
      } else {
        fileList.push(fullPath);
      }
    }
  } catch (err) {
    // If directory doesn't exist or is inaccessible, ignore and return empty
  }
  return fileList;
}

/**
 * Checks if a file path matches the data files heuristic.
 * @param {string} filePath - Absolute path to the file.
 * @param {string} projectRoot - Absolute path to the project root.
 * @param {string[]} extraDataFiles - Explicit files from meridianrc.json.
 * @returns {boolean} - True if it qualifies as a data file.
 */
function isDataFile(filePath, projectRoot, extraDataFiles) {
  const relativePath = path.relative(projectRoot, filePath).replace(/\\/g, '/');
  
  if (extraDataFiles.includes(relativePath)) return true;
  
  if (relativePath.startsWith('src/') && (relativePath.endsWith('.js') || relativePath.endsWith('.json'))) {
    if (relativePath.includes('/data/') || relativePath.includes('/content/') || relativePath.includes('/constants/')) {
      return true;
    }
  }
  
  return false;
}

/**
 * Scans for data files in the project.
 * @param {string} projectRoot - The root directory of the project.
 * @returns {Promise<string[]>} - Array of matching absolute file paths.
 */
async function findDataFiles(projectRoot) {
  let extraDataFiles = [];
  try {
    const rcPath = path.join(projectRoot, 'meridianrc.json');
    if (existsSync(rcPath)) {
      const rcContent = await fs.readFile(rcPath, 'utf8');
      const rcJson = JSON.parse(rcContent);
      if (Array.isArray(rcJson.dataFiles)) {
        extraDataFiles = rcJson.dataFiles;
      }
    }
  } catch (err) {
    // Gracefully ignore reading/parsing errors for the config
  }

  const srcDir = path.join(projectRoot, 'src');
  const allSrcFiles = await getAllFiles(srcDir);
  
  const matchedFiles = allSrcFiles.filter(file => isDataFile(file, projectRoot, extraDataFiles));
  
  for (const extra of extraDataFiles) {
    const extraPath = path.join(projectRoot, extra);
    if (existsSync(extraPath) && !matchedFiles.includes(extraPath)) {
      if (extraPath.endsWith('.js') || extraPath.endsWith('.json')) {
        matchedFiles.push(extraPath);
      }
    }
  }
  
  return matchedFiles;
}

/**
 * Recursively walks an object or array to extract string leaf values and their keys.
 * @param {any} node - The current node in the tree.
 * @param {Object} registry - The registry for the current file.
 * @param {string} [currentKey] - The object key that holds the current node.
 */
function walkTree(node, registry, currentKey = null) {
  if (typeof node === 'string') {
    if (currentKey) {
      const cls = classifyString(node);
      if (cls && !registry[cls].includes(currentKey)) {
        registry[cls].push(currentKey);
      }
    }
  } else if (Array.isArray(node)) {
    node.forEach(item => walkTree(item, registry, currentKey));
  } else if (node && typeof node === 'object') {
    Object.entries(node).forEach(([key, value]) => walkTree(value, registry, key));
  }
}

/**
 * Parses a JSON file and extracts string leaf values.
 * @param {string} filePath - Absolute path to the JSON file.
 * @returns {Promise<Object>} - The categorized registry for the file.
 */
async function parseJsonFile(filePath) {
  const code = await fs.readFile(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(code);
  } catch (err) {
    console.warn(chalk.yellow(`Warning: Failed to parse JSON file ${filePath}: ${err.message}`));
    return null;
  }
  
  const registry = { translatable: [], identifier: [], skip: [] };
  
  walkTree(data, registry);
  
  if (registry.translatable.length === 0) delete registry.translatable;
  if (registry.identifier.length === 0) delete registry.identifier;
  if (registry.skip.length === 0) delete registry.skip;
  
  return Object.keys(registry).length > 0 ? registry : null;
}

/**
 * Parses a JS file and extracts string leaf values from exports.
 * @param {string} filePath - Absolute path to the JS file.
 * @returns {Promise<Object>} - The categorized registry for the file.
 */
async function parseJsFile(filePath) {
  const code = await fs.readFile(filePath, 'utf8');
  
  const registry = { translatable: [], identifier: [], skip: [] };
  
  try {
    const ast = babel.parse(code, {
      filename: filePath,
      sourceType: 'module',
      parserOpts: {
        plugins: ['jsx', 'typescript']
      }
    });

    babel.traverse(ast, {
      StringLiteral(p) {
        const exportParent = p.findParent(parent => parent.isExportDeclaration());
        if (!exportParent) return;

        const objProp = p.findParent(parent => parent.isObjectProperty());
        if (objProp) {
          const keyNode = objProp.node.key;
          const keyName = keyNode.type === 'Identifier' ? keyNode.name : keyNode.value;
          if (typeof keyName === 'string') {
            const cls = classifyString(p.node.value);
            if (cls && !registry[cls].includes(keyName)) {
              registry[cls].push(keyName);
            }
          }
        }
      },
      TemplateLiteral(p) {
        const exportParent = p.findParent(parent => parent.isExportDeclaration());
        if (!exportParent || p.node.expressions.length > 0) return;

        const objProp = p.findParent(parent => parent.isObjectProperty());
        if (objProp) {
          const keyNode = objProp.node.key;
          const keyName = keyNode.type === 'Identifier' ? keyNode.name : keyNode.value;
          if (typeof keyName === 'string') {
            const value = p.node.quasis[0].value.raw;
            const cls = classifyString(value);
            if (cls && !registry[cls].includes(keyName)) {
              registry[cls].push(keyName);
            }
          }
        }
      }
    });
  } catch (err) {
    console.warn(chalk.yellow(`Warning: Failed to parse JS file ${filePath}: ${err.message}`));
    return null;
  }
  
  if (registry.translatable.length === 0) delete registry.translatable;
  if (registry.identifier.length === 0) delete registry.identifier;
  if (registry.skip.length === 0) delete registry.skip;
  
  return Object.keys(registry).length > 0 ? registry : null;
}

/**
 * Scans project for data files and classifies their string leaf values.
 * @param {string} projectRoot - Absolute path to the project root.
 * @returns {Promise<Object>} - The global registry of classified strings.
 */
export async function scanDataFiles(projectRoot) {
  const files = await findDataFiles(projectRoot);
  const globalRegistry = {};
  
  for (const file of files) {
    const relativePath = path.relative(projectRoot, file).replace(/\\/g, '/');
    let fileRegistry = null;
    
    if (file.endsWith('.js')) {
      fileRegistry = await parseJsFile(file);
    } else if (file.endsWith('.json')) {
      fileRegistry = await parseJsonFile(file);
    }
    
    if (fileRegistry) {
      globalRegistry[relativePath] = fileRegistry;
    }
  }
  
  return globalRegistry;
}
