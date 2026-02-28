import fs from 'fs';
import path from 'path';
import { execa } from 'execa';

/**
 * Detects the package manager and installs i18next dependencies asynchronously.
 * @param {string} cwd - Current working directory of the user's project
 * @returns {Promise<void>}
 */
export async function installI18nDependencies(cwd) {
  let pm = 'npm';
  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) {
    pm = 'yarn';
  } else if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) {
    pm = 'pnpm';
  } else if (fs.existsSync(path.join(cwd, 'bun.lockb'))) {
    pm = 'bun';
  }

  const args = pm === 'npm' ? ['install', '--save'] : ['add'];
  args.push('i18next', 'react-i18next', 'i18next-browser-languagedetector');

  try {
    await execa(pm, args, { cwd });
  } catch (err) {
    throw new Error(`Failed to install i18next dependencies using ${pm}: ${err.message}`);
  }
}
