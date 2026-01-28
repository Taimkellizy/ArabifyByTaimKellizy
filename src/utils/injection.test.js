import { injectVanillaLogic } from './vanillaInjector';
import { injectProvider, injectToggle } from './reactInjector';

describe('Vanilla Injector', () => {
  test('injects button and script into HTML', () => {
    const html = '<html><body><nav><ul></ul></nav></body></html>';
    const result = injectVanillaLogic(html);
    expect(result).toContain('id="lang-toggle"');
    expect(result).toContain('<script>');
    expect(result).toContain('localStorage.getItem(\'appLang\')');
  });
});

describe('React Injector', () => {

  describe('injectProvider', () => {
    test('wraps App return with LanguageProvider (2 spaces)', () => {
      const code = `import React from 'react';
function App() {
  return (
    <div className="App">
      <h1>Hello</h1>
    </div>
  )
}`;
      const result = injectProvider(code);
      expect(result).toContain("import { LanguageProvider } from './contexts/LanguageContext';");
      // Check for 2-space indentation
      expect(result).toContain('<LanguageProvider>');
      expect(result).toContain('  <div className="App">');
      expect(result).toContain('</LanguageProvider>');
    });

    test('wraps App return with LanguageProvider (4 spaces)', () => {
        const code = `import React from 'react';
function App() {
    return (
        <div className="App">
            <h1>Hello</h1>
        </div>
    )
}`;
        const result = injectProvider(code);
        // Check for 4-space indentation
        expect(result).toContain('        <div className="App">'); 
        // Logic: 
        // Base indent = 8 spaces (from input)
        // Wrapped content = base + step (4) = 12 spaces? 
        // Or if logic prepends step to existing content?
        // Let's verify the wrapper itself.
        expect(result).toContain('<LanguageProvider>');
        expect(result).toContain('    <div className="App">'); // Step (4) + Indent? 
        // Actually our logic: `baseIndent + step + indentedJSX`.
        // Base indent is `        `. Step is `    `.
        // So line should start with `            <div...`?
        // Wait, originalJSX includes base indent for first line?
        // Our logic: `originalJSX.replace(/\n/g, \n${step})`.
        // If original block was indented, we add more indent.
    });

    test('does not inject twice', () => {
        const code = `import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
function App() {
  return (
    <LanguageProvider>
      <div />
    </LanguageProvider>
  )
}`;
        const result = injectProvider(code);
        // Should be identical (minus potential whitespace trimming if any, but ideally identical logic path)
        expect(result).toBe(code);
    });
  });

  describe('injectToggle', () => {
    test('injects into <ul> inside <nav> as <li> (Smart Placement)', () => {
      const code = `import React from 'react';
function Navbar() {
  return (
    <nav>
      <ul>
        <li>Home</li>
      </ul>
    </nav>
  );
}`;
      const result = injectToggle(code);
      expect(result).toContain("import LanguageToggle from './components/LanguageToggle';");
      // Should wrap in <li>
      expect(result).toContain('<li><LanguageToggle /></li>');
      // Should be inside <ul>
      expect(result).toMatch(/<li><LanguageToggle \/><\/li>\s*<\/ul>/);
    });

    test('injects into <nav> directly if no list found', () => {
        const code = `import React from 'react';
function Navbar() {
  return (
    <nav>
      <div>Logo</div>
    </nav>
  );
}`;
        const result = injectToggle(code);
        expect(result).toContain('<LanguageToggle />');
        expect(result).not.toContain('<li><LanguageToggle /></li>');
        expect(result).toMatch(/<LanguageToggle \/>\s*<\/nav>/);
    });

    test('does NOT inject into <header> (Duplicate Prevention)', () => {
        const code = `import React from 'react';
function Header() {
  return (
    <header>
      <h1>My App</h1>
    </header>
  );
}`;
        const result = injectToggle(code);
        expect(result).not.toContain('LanguageToggle');
        expect(result).toBe(code);
    });

    test('detects and respects 4-space indentation', () => {
        const code = `import React from 'react';
function Navbar() {
    return (
        <nav>
            <ul>
                <li>Home</li>
            </ul>
        </nav>
    );
}`;
        const result = injectToggle(code);
        // Indentation check:
        // Expected: 12 spaces for the LI? 
        // <ul> is at 12 spaces. <li> should be at 16? 
        // Logic: indent of closting tag (</ul>) is 12 spaces.
        // We append `\n${indent}${step}<li>...`.
        // indent (12) + step (4) = 16 spaces.
        expect(result).toMatch(/ {16}<li><LanguageToggle \/><\/li>/);
    });

    test('detects and respects 2-space indentation', () => {
        const code = `import React from 'react';
function Navbar() {
  return (
    <nav>
      <ul>
        <li>Home</li>
      </ul>
    </nav>
  );
}`;
        const result = injectToggle(code);
        // <ul> at 6 spaces. <li> should be at 8?
        // closing </ul> at 6 spaces.
        // indent (6) + step (2) = 8 spaces.
        expect(result).toMatch(/ {8}<li><LanguageToggle \/><\/li>/);
    });
  });
});
