import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Import Components
import Header from './components/Header';
import Footer from './components/Footer';

// Import Pages
import Home from './pages/Home';
import Blog from './pages/Blog';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <div className='App'>
        <Router>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<Blog />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </div>
    </LanguageProvider>

  );
}

export default App;