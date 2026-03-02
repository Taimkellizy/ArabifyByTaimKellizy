import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import babel from '@babel/core';

/**
 * Finds user's React entry point, safely injects 'import "./i18n";' at the top,
 * and maintains original formatting and comments. Also wraps root in Suspense.
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
    return 'Warning: Could not automatically locate a React entry point (e.g., src/index.js, src/main.jsx). Please manually add `import "./i18n";` to your entry file and wrap your app in `<Suspense>`.';
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

    let alreadyImportedI18n = false;
    let insertIndex = 0;
    
    let rootRenderFound = false;
    let rootElementStart = -1;
    let rootElementEnd = -1;

    babel.traverse(ast, {
      ImportDeclaration(path) {
        if (path.node.source.value === './i18n') {
          alreadyImportedI18n = true;
        }
      },
      Program(path) {
        const body = path.node.body;
        if (body.length > 0) {
          // If there's an import or any statement, start before the first one
          insertIndex = body[0].start;
        }
      },
      CallExpression(path) {
        const callee = path.node.callee;
        // Look for ReactDOM.render(...) or root.render(...)
        if (
          callee.type === 'MemberExpression' &&
          callee.property.type === 'Identifier' &&
          callee.property.name === 'render'
        ) {
          const arg = path.node.arguments[0];
          // e.g. .render(<App />)
          if (arg && (arg.type === 'JSXElement' || arg.type === 'JSXFragment')) {
            rootRenderFound = true;
            rootElementStart = arg.start;
            rootElementEnd = arg.end;
          }
        }
      }
    });

    if (alreadyImportedI18n && !rootRenderFound) {
      return 'Info: "./i18n" is already imported in the entry file and root render modify failed.';
    }

    let importsToInject = "";
    if (!alreadyImportedI18n) {
      importsToInject = "import { Suspense } from 'react';\nimport './i18n';\n";
    }

    let newCode = code;

    if (rootRenderFound && rootElementStart !== -1) {
        const originalElement = code.slice(rootElementStart, rootElementEnd);
        const wrappedElement = `
// MERIDIAN AUTO-GENERATED:
// Replace this fallback div with your app's custom loading spinner.
<Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading translations...</div>}>
  ${originalElement}
</Suspense>`.trim();
        newCode = newCode.slice(0, rootElementStart) + wrappedElement + newCode.slice(rootElementEnd);
    }
    
    if (importsToInject) {
        newCode = newCode.slice(0, insertIndex) + importsToInject + newCode.slice(insertIndex);
    }
    
    await fs.writeFile(entryFile, newCode, 'utf8');
    return null; // success
  } catch (err) {
    throw new Error(`Failed to inject i18n import into entry point: ${err.message}`);
  }
}
