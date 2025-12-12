import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Vercel/Vite Fix: Polyfill 'process' to avoid ReferenceError: process is not defined
// This ensures the app doesn't crash immediately on load in the browser.
if (typeof window !== 'undefined' && !window.process) {
  // @ts-ignore
  window.process = { env: {} };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);