import { StrictMode, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { DownloadPrompt } from './components/DownloadPrompt';
import { detectMobileStorePlatform, DOWNLOAD_PATH, STORE_LINKS } from './downloads';
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

function DownloadPage() {
  useEffect(() => {
    const platform = detectMobileStorePlatform();
    if (platform) {
      window.location.replace(STORE_LINKS[platform]);
    }
  }, []);

  return (
    <main className="app-shell">
      <DownloadPrompt title="Preuzmi MAHALA aplikaciju" description="Odaberi prodavnicu za svoj telefon." />
    </main>
  );
}

const pathname = window.location.pathname.replace(/\/+$/, '');
const isDownloadPage = pathname === DOWNLOAD_PATH || pathname === '/download';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RuntimeFallback>
      {isDownloadPage ? <DownloadPage /> : <App />}
    </RuntimeFallback>
  </StrictMode>,
);
