import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './ui/App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// App shell offline cache (production only; camera needs HTTPS anyway).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
