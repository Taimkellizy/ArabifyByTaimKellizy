import { describe, it, expect } from 'vitest';
import { nextConfigFixer } from './nextConfigFixer.js';

describe('nextConfigFixer', () => {
  const defaultOpts = { locales: ['en', 'ar', 'es'], defaultLocale: 'en' };

  it('should inject i18n block into a standard CommonJS module.exports', () => {
    const source = `
module.exports = {
  reactStrictMode: true,
  swcMinify: true
};
`;
    const result = nextConfigFixer(source, defaultOpts);
    expect(result.success).toBe(true);
    expect(result.modified).toBe(true);
    expect(result.code).toMatch(/i18n: {/);
    expect(result.code).toMatch(/locales: \[(['"]en['"],\s*){0,1}['"]en['"],\s*['"]ar['"],\s*['"]es['"]\]/);
    expect(result.code).toMatch(/defaultLocale: ['"]en['"]/);
    expect(result.code).toMatch(/swcMinify: true/); // Preserves existing
  });

  it('should inject i18n block into a standard ESM export default', () => {
    const source = `
/** @type {import('next').NextConfig} */
export default {
  images: { domains: ['example.com'] },
};
`;
    const result = nextConfigFixer(source, defaultOpts);
    expect(result.success).toBe(true);
    expect(result.modified).toBe(true);
    expect(result.code).toMatch(/i18n: {/);
    expect(result.code).toMatch(/locales: \[['"]en['"],\s*['"]ar['"],\s*['"]es['"]\]/);
    expect(result.code).toMatch(/defaultLocale: ['"]en['"]/);
    expect(result.code).toMatch(/images: {/); // Preserves existing
  });

  it('should handle variable references in CommonJS', () => {
    const source = `
const nextConfig = {
  env: { key: 'value' }
};

module.exports = nextConfig;
`;
    const result = nextConfigFixer(source, defaultOpts);
    expect(result.success).toBe(true);
    expect(result.modified).toBe(true);
    expect(result.code).toMatch(/i18n: {/);
  });

  it('should safely merge into an existing i18n block', () => {
    const source = `
module.exports = {
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'fr'
  }
};
`;
    const result = nextConfigFixer(source, defaultOpts);
    expect(result.success).toBe(true);
    expect(result.modified).toBe(true);
    // Should merge ar and es into the array, and update defaultLocale to en
    expect(result.code).toMatch(/locales: \[['"]en['"],\s*['"]fr['"],\s*['"]ar['"],\s*['"]es['"]\]/);
    expect(result.code).toMatch(/defaultLocale: ['"]en['"]/);
  });

  it('should return not modified if everything is already configured perfectly', () => {
    const source = `
module.exports = {
  i18n: {
    locales: ['en', 'ar', 'es'],
    defaultLocale: 'en'
  }
};
`;
    const result = nextConfigFixer(source, defaultOpts);
    expect(result.success).toBe(true);
    expect(result.modified).toBe(false);
  });

  it('should bailout and fail on wrapped configuration exports', () => {
    const source = `
const withBundleAnalyzer = require('@next/bundle-analyzer')();
module.exports = withBundleAnalyzer({
  reactStrictMode: true
});
`;
    const result = nextConfigFixer(source, defaultOpts);
    expect(result.success).toBe(false);
    expect(result.modified).toBe(false);
    expect(result.reason).toContain('complex expression');
  });

  it('should bailout on async function exports', () => {
    const source = `
module.exports = async (phase, { defaultConfig }) => {
  return {
    reactStrictMode: true
  };
};
`;
    const result = nextConfigFixer(source, defaultOpts);
    expect(result.success).toBe(false);
    expect(result.modified).toBe(false);
    expect(result.reason).toContain('complex expression');
  });

  it('should bailout on conditional variables', () => {
    const source = `
let config;
if (process.env.NODE_ENV === 'development') {
  config = { dev: true };
} else {
  config = { dev: false };
}
module.exports = config;
`;
    const result = nextConfigFixer(source, defaultOpts);
    // Our resolver won't find a direct ObjectExpression init for config
    expect(result.success).toBe(false);
    expect(result.modified).toBe(false);
  });
});
