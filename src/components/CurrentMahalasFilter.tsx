import { Activity, Check, MapPin, SlidersHorizontal, X } from 'lucide-react';

type CurrentMahala = {
  id: string;
  name: string;
  level?: number | null;
};

export default function CurrentMahalasFilter({
  mahalas,
  enabledIds,
  onToggle,
}: {
  mahalas: CurrentMahala[];
  enabledIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  if (!mahalas.length) {
    return null;
  }

  return (
    <section className="current-mahalas-filter">
      <div className="current-mahalas-filter-header">
        <span>
          <MapPin size={14} />
          Trenutne MAHALE
        </span>
        <SlidersHorizontal size={15} />
      </div>
      <div className="current-mahalas-filter-list">
        {mahalas.map((mahala) => {
          const active = enabledIds.has(mahala.id);

          return (
            <button
              key={mahala.id}
              className={active ? 'active' : ''}
              type="button"
              onClick={() => onToggle(mahala.id)}
            >
              <span className={`current-mahala-dot level-${Number(mahala.level) || 0}`} />
              <span>{mahala.name}</span>
              <small>{active ? 'Ukljuceno' : 'Utisano'}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function CurrentMahalasSheet({
  open,
  mahalas,
  enabledIds,
  onToggle,
  onOpenFeed,
  onOpenTopics,
  onClose,
}: {
  open: boolean;
  mahalas: CurrentMahala[];
  enabledIds: Set<string>;
  onToggle: (id: string) => void;
  onOpenFeed: () => void;
  onOpenTopics: () => void;
  onClose: () => void;
}) {
  if (!open || !mahalas.length) {
    return null;
  }

  return (
    <div className="current-mahalas-sheet-layer" role="presentation" onClick={onClose}>
      <section
        className="current-mahalas-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="MAHALE u kojima se nalazim"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="current-mahalas-sheet-handle" />
        <div className="current-mahalas-sheet-header">
          <div>
            <h2>MAHALE u kojima se nalazim</h2>
            <p>Filtriraj objave i teme iz zeljenih MAHALA</p>
          </div>
          <button type="button" className="current-mahalas-sheet-close" aria-label="Zatvori" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="current-mahalas-sheet-list">
          {mahalas.map((mahala, index) => {
            const active = enabledIds.has(String(mahala.id));
            const level = Number(mahala.level) || 0;
            const primary = index === 0 || level === 0;

            return (
              <button
                key={mahala.id}
                className={`current-mahalas-sheet-row ${active ? 'active' : ''} ${primary ? 'primary' : ''}`}
                type="button"
                onClick={() => onToggle(String(mahala.id))}
              >
                <span className={`current-mahalas-sheet-accent level-${level}`} />
                <span className="current-mahalas-sheet-main">
                  <small>{level === 0 ? 'Glavna MAHALA' : level === 1 ? 'MAHALA level 1' : 'MAHALA level 2'}</small>
                  <strong>{mahala.name}</strong>
                  {!primary ? <em>u sklopu trenutne lokacije</em> : null}
                </span>
                <span className={`current-mahalas-sheet-action ${active ? 'active' : ''}`}>
                  {active ? <Check size={14} /> : <Activity size={14} />}
                  {active ? 'Utisaj' : 'Aktiviraj'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="current-mahalas-sheet-footer">
          <button type="button" className="secondary" onClick={onOpenTopics}>
            Idi na teme
          </button>
          <button type="button" onClick={onOpenFeed}>
            Idi na objave
          </button>
        </div>
      </section>
    </div>
  );
}
