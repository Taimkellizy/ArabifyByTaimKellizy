import fs from 'fs';
import path from 'path';
import { nextDocumentFixer } from './nextDocumentFixer.js';
import { nextLayoutFixer } from './nextLayoutFixer.js';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Next.js Fixers', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync('meridian-test-');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('nextDocumentFixer should not inject a literal "en" string for lang', () => {
    const filePath = path.join(tmpDir, '_document.tsx');
    const source = `
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
    `;
    fs.writeFileSync(filePath, source);

    nextDocumentFixer(filePath);

    const updatedSource = fs.readFileSync(filePath, 'utf8');
    expect(updatedSource).not.toMatch(/lang="en"/);
    expect(updatedSource).not.toMatch(/lang={'en'}/);
    expect(updatedSource).toMatch(/lang={this\.props\.locale}/);
    expect(updatedSource).toMatch(/dir={dirFromLocale\(this\.props\.locale\)}/);
    expect(updatedSource).toMatch(/locale:\s*ctx\.locale\s*\|\|\s*defaultLocale/);
    expect(updatedSource).toMatch(/import.*defaultLocale.*from/);
  });

  it('nextDocumentFixer should throw explicit error if no Html tag is found', () => {
    const filePath = path.join(tmpDir, '_document.tsx');
    const source = `
export default function MyDocument() {
  return <div>Missing Html tag</div>;
}
    `;
    fs.writeFileSync(filePath, source);

    expect(() => {
      nextDocumentFixer(filePath);
    }).toThrow(/No <Html> tag found/);
  });

  it('nextLayoutFixer should correctly handle dynamic segment and not inject literal "en"', () => {
    const appDir = path.join(tmpDir, 'src', 'app', '[locale]');
    fs.mkdirSync(appDir, { recursive: true });
    
    const filePath = path.join(appDir, 'layout.tsx');
    const source = `
export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
    `;
    fs.writeFileSync(filePath, source);

    nextLayoutFixer(filePath);

    const updatedSource = fs.readFileSync(filePath, 'utf8');
    expect(updatedSource).not.toMatch(/lang="en"/);
    expect(updatedSource).not.toMatch(/lang={'en'}/);
    expect(updatedSource).toMatch(/lang={params\.locale}/);
    expect(updatedSource).toMatch(/dir={dirFromLocale\(params\.locale\)}/);
    expect(updatedSource).toMatch(/params,/); 
  });

  it('nextLayoutFixer should throw explicit error if component has no parameters', () => {
    const appDir = path.join(tmpDir, 'src', 'app', '[lang]');
    fs.mkdirSync(appDir, { recursive: true });
    
    const filePath = path.join(appDir, 'layout.tsx');
    const source = `
export default function RootLayout() {
  return (
    <html>
      <body>No params here</body>
    </html>
  );
}
    `;
    fs.writeFileSync(filePath, source);

    expect(() => {
      nextLayoutFixer(filePath);
    }).toThrow(/The default exported layout component has no parameters/);
  });
});
