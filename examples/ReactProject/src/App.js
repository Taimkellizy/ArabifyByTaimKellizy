import React from 'react';
import Navbar from './components/Navbar';

// STANDARD REACT APP
// Upload this to test the "Multi-Lang" injection mode.
// Arabify should:
// 1. Inject import { LanguageProvider } ...
// 2. Wrap the return with <LanguageProvider>

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Navbar />
        <h1>Welcome to React</h1>
      </header>
      <main>
        <p>This is a standard React application structure.</p>
      </main>
    </div>
  );
}

export default App;
