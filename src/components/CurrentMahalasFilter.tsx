import { MapPin, SlidersHorizontal } from 'lucide-react';

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
