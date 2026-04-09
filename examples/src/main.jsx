import { Suspense } from 'react';
import './i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  // MERIDIAN AUTO-GENERATED:
  // Replace this fallback div with your app's custom loading spinner.
  <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading translations...</div>}>
  <StrictMode>
    <App />
  </StrictMode>
</Suspense>
);