import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import { applyEdits } from './i18n/applyEdits.js';

const traverse = _traverse.default || _traverse;

/** @type {Set<string>} BCP-47 language codes that use a right-to-left script. */
const RTL_LANGUAGE_CODES = new Set([
  'ar', 'he', 'fa', 'ur', 'ku', 'dv', 'ps', 'sd', 'ug', 'yi'
]);

/**
 * Writes file contents through Meridian's temp-file swap pattern.
 *
 * @param {string} filePath - Absolute path to write.
 * @param {string} content  - New file contents.
 * @returns {void}
 * @throws {Error} When the temporary write or rename fails.
 */
function atomicWriteFile(filePath, content) {
  const tmpPath = `${filePath}.meridian-tmp`;
  try {
    fs.writeFileSync(tmpPath, content, 'utf8');
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    throw err;
  }
}

/**
 * Computes a POSIX relative import path from `fromFilePath` to a module
 * rooted at the nearest recognised source root (`src`, `app`, `pages`).
 *
 * Example: from `src/pages/_document.tsx` to `i18n` resolves to `../i18n`.
 *
 * @param {string} fromFilePath      - Absolute path of the file being modified.
 * @param {string} targetRelSubPath  - Module path relative to the source root,
 *   without a leading slash (e.g. `"i18n"` or `"utils/helpers"`).
 * @returns {string} A "./"- or "../"-prefixed ES-module import specifier.
 */
function computeRelativeImport(fromFilePath, targetRelSubPath) {
  const normalised = fromFilePath.replace(/\\/g, '/');
  const sourceRoots = ['src', 'app'];

  // Find the deepest recognised root segment in the absolute path.
  let srcRootAbsolute = null;
  for (const root of sourceRoots) {
    const idx = normalised.lastIndexOf(`/${root}/`);
    if (idx !== -1) {
      const candidate = normalised.slice(0, idx + root.length + 2); // includes trailing /
      if (!srcRootAbsolute || candidate.length > srcRootAbsolute.length) {
        srcRootAbsolute = candidate;
      }
    }
  }

  if (!srcRootAbsolute) {
    // Fallback: treat the file's directory as the root.
    srcRootAbsolute = normalised.substring(0, normalised.lastIndexOf('/') + 1);
  }

  const fileDir = normalised.substring(0, normalised.lastIndexOf('/'));
  const targetAbsolute = `${srcRootAbsolute.replace(/\/$/, '')}/${targetRelSubPath}`;

  // Manual POSIX relative path resolver.
  const fromParts = fileDir.split('/').filter(Boolean);
  const toParts = targetAbsolute.split('/').filter(Boolean);
  let common = 0;
  while (
    common < fromParts.length &&
    common < toParts.length &&
    fromParts[common] === toParts[common]
  ) {
    common++;
  }

  const ups = fromParts.length - common;
  const downs = toParts.slice(common);
  const rel = [...Array(ups).fill('..'), ...downs].join('/');
  return rel.startsWith('.') ? rel : `./${rel}`;
}

/**
 * Parses a JSX/TSX file with the Babel parser.
 *
 * @param {string} source   - File source text.
 * @param {string} filePath - Absolute path (used to choose plugins).
 * @returns {import('@babel/parser').ParseResult} Parsed AST.
 */
function parseSource(source, filePath) {
  const plugins = ['typescript', 'decorators-legacy', 'classProperties'];
  const isPureTs = filePath.endsWith('.ts') && !filePath.endsWith('.tsx');
  if (!isPureTs) plugins.push('jsx');
  return parse(source, { sourceType: 'module', plugins });
}

/**
 * Finds the last `ImportDeclaration` node in a program body and returns its
 * end offset, or `0` if there are no imports.
 *
 * @param {import('@babel/parser').ParseResult} ast - Parsed AST.
 * @returns {number} Character offset immediately after the last import.
 */
function findLastImportEnd(ast) {
  let end = 0;
  for (const node of ast.program.body) {
    if (node.type === 'ImportDeclaration') end = node.end;
    else break;
  }
  return end;
}

/**
 * Injects a dynamic `dir` attribute onto the root `<Html>` or `<html>` JSX
 * element in a Next.js `_document` file so that the HTML direction mirrors
 * the active i18next language at runtime.
 *
 * **Behaviour**
 * - If a `dir` attribute already exists the file is left unchanged (idempotent).
 * - When `languages` contains at least one RTL language code the injected
 *   value is `{i18n.dir(i18n.language)}` and a default import of the project's
 *   `i18n` module is added (path computed relative to `filePath`).
 * - When no RTL language is present a static `dir="ltr"` is injected.
 * - Uses the atomic write pattern (`.meridian-tmp` swap).
 *
 * @param {string}   filePath  - Absolute path to `_document.tsx` or `_document.jsx`.
 * @param {string[]} languages - Language codes configured for the project.
 * @returns {boolean} `true` when the file was modified; `false` when already
 *   up to date or when the HTML element could not be located.
 */
export function injectDirAttribute(filePath, languages) {
  const source = fs.readFileSync(filePath, 'utf8');

  // Idempotency guard — already has a dir attribute.
  if (/\bdir\s*=/.test(source)) return false;

  const ast = parseSource(source, filePath);
  const hasRTL = languages.some(l => RTL_LANGUAGE_CODES.has(l));

  // Locate the <Html> or <html> opening element.
  let htmlOpeningElement = null;
  traverse(ast, {
    JSXOpeningElement(nodePath) {
      const name = nodePath.node.name?.name;
      if ((name === 'Html' || name === 'html') && !htmlOpeningElement) {
        htmlOpeningElement = nodePath.node;
        nodePath.stop();
      }
    }
  });

  if (!htmlOpeningElement) return false;

  // Insert dir attribute immediately after the tag name ("Html" / "html").
  const insertAfterName = htmlOpeningElement.name.end;
  const dirAttrText = hasRTL
    ? ' dir={i18n.dir(i18n.language)}'
    : ' dir="ltr"';

  const edits = [
    { start: insertAfterName, end: insertAfterName, replacement: dirAttrText }
  ];

  // Add the i18n default import when needed.
  if (hasRTL && !source.includes('import i18n from')) {
    const lastImportEnd = findLastImportEnd(ast);
    if (lastImportEnd > 0) {
      const i18nImportPath = computeRelativeImport(filePath, 'i18n');
      edits.push({
        start: lastImportEnd,
        end: lastImportEnd,
        replacement: `\nimport i18n from '${i18nImportPath}';`
      });
    }
  }

  const updated = applyEdits(source, edits);
  atomicWriteFile(filePath, updated);
  return true;
}
