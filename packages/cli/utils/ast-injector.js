import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import babel from '@babel/core';

/**
 * Finds user's React entry point, safely injects 'import "./i18n";' at the top,
 * and maintains original formatting and comments.
 * @param {string} cwd - Current working directory
 * @returns {Promise<string|null>} - Returns a warning string if entry point not found, otherwise null on success
 */
export async function injectI18nImport(cwd) {
  const possibleEntries = [
    'src/index.js',
    'src/index.tsx',
    'src/main.jsx',
    'src/main.tsx'
  ];

  let entryFile = null;
  for (const file of possibleEntries) {
    const fullPath = path.join(cwd, file);
    if (existsSync(fullPath)) {
      entryFile = fullPath;
      break;
    }
  }

  if (!entryFile) {
    return 'Warning: Could not automatically locate a React entry point (e.g., src/index.js, src/main.jsx). Please manually add `import "./i18n";` to your entry file.';
  }

  try {
    const code = await fs.readFile(entryFile, 'utf8');

    // Parse AST to safely locate where to insert the import
    const ast = babel.parse(code, {
      filename: entryFile,
      parserOpts: {
        plugins: [
          'jsx',
          'typescript'
        ]
      }
    });

    if (!ast) {
      throw new Error('Failed to parse AST from entry file');
    }

    let alreadyImported = false;
    let insertIndex = 0;

    babel.traverse(ast, {
      ImportDeclaration(path) {
        if (path.node.source.value === './i18n') {
          alreadyImported = true;
          path.stop();
        }
      },
      Program(path) {
        const body = path.node.body;
        if (body.length > 0) {
          // If there's an import or any statement, start before the first one
          insertIndex = body[0].start;
        }
      }
    });

    if (alreadyImported) {
      return 'Info: "./i18n" is already imported in the entry file.';
    }

    // Safely inject without disrupting formatting
    const newCode = code.slice(0, insertIndex) + "import './i18n';\n" + code.slice(insertIndex);
    
    await fs.writeFile(entryFile, newCode, 'utf8');
    return null; // success
  } catch (err) {
    throw new Error(`Failed to inject i18n import into entry point: ${err.message}`);
  }
}
