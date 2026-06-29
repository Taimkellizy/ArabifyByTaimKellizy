import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { injectVanillaLogic } from './vanillaInjector.js';
import { injectProvider, injectToggle } from './reactInjector.js';
import fs from 'fs';

describe('Vanilla Injector', () => {
  it('injects button and script into HTML', async () => {
    // Mock DOMParser for Node test environment
    const { JSDOM } = await import('jsdom');
    const { window } = new JSDOM();
    global.DOMParser = window.DOMParser;
    const html = '<html><body><nav><ul></ul></nav></body></html>';
    const result = injectVanillaLogic(html);
    assert.match(result, /id="lang-toggle"/);
    assert.match(result, /<script>/);
    assert.match(result, /localStorage\.getItem\('appLang'\)/);
  });
});

describe('React Injector', () => {

  describe('injectProvider', () => {
    it('wraps App return with LanguageProvider (2 spaces)', () => {
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
      assert.ok(result.includes('import { LanguageProvider, LanguageContext } from "./contexts/LanguageContext";'));
      assert.ok(result.includes('<LanguageProvider>'));
      assert.ok(result.includes('  <App {...props} />'));
      assert.ok(result.includes('</LanguageProvider>'));
    });

    it('wraps App return with LanguageProvider (4 spaces)', () => {
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
        assert.ok(result.includes('    <App {...props} />')); 
        assert.ok(result.includes('<LanguageProvider>'));
    });

    it('does not inject twice', () => {
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
        assert.strictEqual(result.replace(/\r?\n/g, '\n'), code.replace(/\r?\n/g, '\n'));
    });

    it('skips wrap and emits warning if _app.tsx is already wrapped (double-wrap pattern)', (t) => {
        const warnings = [];
        t.mock.method(console, 'warn', (...args) => {
            warnings.push(args.join(' '));
        });
        
        t.mock.method(fs, 'existsSync', (p) => {
            if (p.includes('_app')) return true;
            return false;
        });

        t.mock.method(fs, 'readFileSync', (p) => {
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
        
        assert.strictEqual(result.includes('<LanguageProvider>'), false);
        assert.ok(warnings.some(w => w.includes('meridian sync warning: /src/pages/index.tsx is already wrapped by a provider in')));
        assert.ok(warnings.some(w => w.includes('skipping duplicate wrap')));
    });
  });

  describe('injectToggle', () => {
    it('injects into <ul> inside <nav> as <li> (Smart Placement)', () => {
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
      assert.ok(result.includes('import LanguageToggle from "./components/LanguageToggle";'));
      assert.ok(result.includes('<LanguageToggle />'));
    });

    it('injects into <nav> directly if no list found', () => {
        const code = `import React from 'react';
function Navbar() {
  return (
    <nav>
      <div>Logo</div>
    </nav>
  );
}`;
        const { code: result } = injectToggle(code);
        assert.ok(result.includes('<LanguageToggle />'));
        assert.strictEqual(result.includes('<li><LanguageToggle /></li>'), false);
        assert.match(result, /<LanguageToggle \/>\s*<\/nav>/);
    });

    it('injects into <header> if no <nav> found (Fallback)', () => {
        const originalCode = `import React from 'react';
function Header() {
  return (
    <header>
      <h1>My App</h1>
    </header>
  );
}`;
        const { code: result } = injectToggle(originalCode);
        assert.ok(result.includes('LanguageToggle'));
        assert.match(result, /<LanguageToggle \/>\s*<\/header>/);
    });

    it('detects and respects 4-space indentation', () => {
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
        assert.ok(result.includes('  <LanguageToggle />'));
    });

    it('detects and respects 2-space indentation', () => {
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
        assert.ok(result.includes('  <LanguageToggle />'));
    });
  });
});
