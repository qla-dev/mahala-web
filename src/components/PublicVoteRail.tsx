import { ChevronDown, ChevronUp } from 'lucide-react';
import type { MouseEvent } from 'react';

export default function PublicVoteRail({
  upvotes,
  downvotes,
  className = '',
  onClick,
}: {
  upvotes: number;
  downvotes: number;
  className?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div className={`public-vote-rail ${className}`} aria-label="Glasanje">
      <button type="button" className="public-vote-badge" onClick={onClick}>
        <ChevronUp size={18} />
        <strong>{upvotes}</strong>
      </button>
      <button type="button" className="public-vote-badge" onClick={onClick}>
        <strong>{downvotes}</strong>
        <ChevronDown size={18} />
      </button>
    </div>
  );
}
