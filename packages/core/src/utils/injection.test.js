import { injectVanillaLogic } from './vanillaInjector';
import { injectProvider, injectToggle } from './reactInjector';
import fs from 'fs';
import { jest } from '@jest/globals';

describe('Vanilla Injector', () => {
  test('injects button and script into HTML', async () => {
    // Mock DOMParser for Node test environment
    const { JSDOM } = await import('jsdom');
    const { window } = new JSDOM();
    global.DOMParser = window.DOMParser;
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
}
export default App;`;
      const result = injectProvider(code);
      expect(result).toContain('import { LanguageProvider, LanguageContext } from "./contexts/LanguageContext";');
      // Check for 2-space indentation
      expect(result).toContain('<LanguageProvider>');
      expect(result).toContain('  <App {...props} />');
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
}
export default App;`;
        const result = injectProvider(code);
        // Check for 4-space indentation
        expect(result).toContain('    <App {...props} />'); 
        expect(result).toContain('<LanguageProvider>');
    });

    test('does not inject twice', () => {
        const code = `import React from 'react';
import { useContext } from "react";
import { LanguageProvider, LanguageContext } from "./contexts/LanguageContext";
function App() {
  const { text } = useContext(LanguageContext);
  return (
    <div />
  )
}
const AppWithLang = (props) => (
  <LanguageProvider>
    <App {...props} />
  </LanguageProvider>
);
export default AppWithLang;`;
        const result = injectProvider(code);
        expect(result).toBe(code.replace(/\r?\n/g, '\r\n'));
    });

    test('skips wrap and emits warning if _app.tsx is already wrapped (double-wrap pattern)', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
        const readFileSyncSpy = jest.spyOn(fs, 'readFileSync').mockImplementation((p) => {
            if (p.includes('_app')) {
                return `
import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
function MyApp({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <Component {...pageProps} />
    </LanguageProvider>
  );
}
export default MyApp;`;
            }
            return '';
        });

        const code = `import React from 'react';
function HomePage() {
  return (
    <div className="HomePage">
      <h1>Hello</h1>
    </div>
  )
}
export default HomePage;`;

        const fileName = '/src/pages/index.tsx';
        const result = injectProvider(code, {}, fileName);
        
        expect(result).not.toContain('<LanguageProvider>');
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('meridian sync warning: /src/pages/index.tsx is already wrapped by a provider in'));
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('skipping duplicate wrap'));
        
        warnSpy.mockRestore();
        existsSyncSpy.mockRestore();
        readFileSyncSpy.mockRestore();
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
      const { code: result } = injectToggle(code);
      expect(result).toContain('import LanguageToggle from "./components/LanguageToggle";');
      // Should be inside nav
      expect(result).toContain('<LanguageToggle />');
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
        const { code: result } = injectToggle(code);
        expect(result).toContain('<LanguageToggle />');
        expect(result).not.toContain('<li><LanguageToggle /></li>');
        expect(result).toMatch(/<LanguageToggle \/>\s*<\/nav>/);
    });

    test('injects into <header> if no <nav> found (Fallback)', () => {
        const code = `import React from 'react';
function Header() {
  return (
    <header>
      <h1>My App</h1>
    </header>
  );
}`;
        const { code: result } = injectToggle(code);
        expect(result).toContain('LanguageToggle');
        expect(result).toMatch(/<LanguageToggle \/>\s*<\/header>/);
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
        const { code: result } = injectToggle(code);
        expect(result).toContain('  <LanguageToggle />');
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
        const { code: result } = injectToggle(code);
        expect(result).toContain('  <LanguageToggle />');
    });
  });
});
