import { StrictMode, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function RuntimeFallback({ children }: { children: ReactNode }) {
  const [hasRuntimeError, setHasRuntimeError] = useState(false);

  useEffect(() => {
    const handleRuntimeError = () => setHasRuntimeError(true);

    window.addEventListener('error', handleRuntimeError);
    window.addEventListener('unhandledrejection', handleRuntimeError);

    return () => {
      window.removeEventListener('error', handleRuntimeError);
      window.removeEventListener('unhandledrejection', handleRuntimeError);
    };
  }, []);

  if (hasRuntimeError) {
    return (
      <div className="app-shell app-error-shell">
        <header className="app-header">
          <div className="brand">
            <img src="/mahala.svg" alt="MAHALA" />
            <span>MAHALA</span>
          </div>
        </header>
        <main className="app-error-panel">
          <h1>MAHALA web se nije učitao</h1>
          <p>Osvježi stranicu ili isključi i ponovo uključi lokaciju za ovaj browser.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Osvježi
          </button>
        </main>
      </div>
    );
  }

  return children;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RuntimeFallback>
      <App />
    </RuntimeFallback>
  </StrictMode>,
);
