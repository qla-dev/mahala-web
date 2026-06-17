import { Apple, Play, Smartphone } from 'lucide-react';

const storeLinks = {
  ios: 'https://apps.apple.com/',
  android: 'https://play.google.com/store',
};

export function StoreButtons() {
  return (
    <div className="store-buttons">
      <a className="store-button" href={storeLinks.ios} target="_blank" rel="noreferrer">
        <Apple size={15} />
        App Store
      </a>
      <a className="store-button" href={storeLinks.android} target="_blank" rel="noreferrer">
        <Play size={15} />
        Google Play
      </a>
    </div>
  );
}

export function DownloadPrompt({
  className = '',
  compact = false,
  title = 'MAHALA aplikacija',
  description = 'Preuzmi native aplikaciju za objave, glasanje, notifikacije, Pro teme i punu MAHALA mapu.',
}: {
  className?: string;
  compact?: boolean;
  title?: string;
  description?: string;
}) {
  return (
    <section className={`${className} download-screen${compact ? ' compact' : ''}`.trim()}>
      <span className="download-screen-icon">
        <Smartphone size={compact ? 28 : 34} />
      </span>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="download-screen-highlights">
        <span>Lokacija uživo</span>
        <span>Teme iz mahale</span>
        <span>Brze notifikacije</span>
      </div>
      <StoreButtons />
    </section>
  );
}

export function DownloadGateModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="download-gate-layer" role="dialog" aria-modal="true" aria-label="Preuzmi MAHALA aplikaciju">
      <button className="download-gate-backdrop" type="button" aria-label="Zatvori" onClick={onClose} />
      <div className="download-gate-modal">
        <button className="download-gate-close" type="button" aria-label="Zatvori" onClick={onClose}>
          x
        </button>
        <DownloadPrompt
          compact
          title="Nastavi u aplikaciji"
          description="Glasanje, komentari i prijave su dostupni u native MAHALA aplikaciji."
        />
      </div>
    </div>
  );
}
