import { useState } from 'react';
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  MessageCircle,
} from 'lucide-react';
import type { Post, PostReply } from '../types';
import { DownloadGateModal } from './DownloadPrompt';

export default function PostDetail({
  post,
  onBack,
}: {
  post: Post;
  onBack: () => void;
}) {
  const [downloadGateOpen, setDownloadGateOpen] = useState(false);
  const replies = post.replies;
  const openDownloadGate = () => setDownloadGateOpen(true);
  const author = post.author.startsWith('@') ? post.author : `@${post.author}`;

  return (
    <section className="detail-panel">
      <button type="button" className="back-button" onClick={onBack}>
        <ChevronLeft size={18} />
        Nazad na objave
      </button>

      <article className="detail-hero-card" style={{ backgroundColor: post.color }}>
        <div className="detail-hero-meta">
          <span>{post.mahala}</span>
          <span>-</span>
          <span>{author}</span>
          <span>-</span>
          <span>{post.timeAgo}</span>
        </div>

        <p className="detail-hero-content">{post.content}</p>

        <div className="detail-action-row">
          <button type="button" className="detail-action-pill" onClick={openDownloadGate}>
            <Bell size={13} />
            Drot
          </button>
        </div>

        <div className="detail-vote-rail" aria-label="Glasanje">
          <button type="button" className="detail-vote-badge" onClick={openDownloadGate}>
            <ChevronUp size={18} />
            <strong>{post.upvotes}</strong>
          </button>
          <button type="button" className="detail-vote-badge" onClick={openDownloadGate}>
            <strong>{post.downvotes}</strong>
            <ChevronDown size={18} />
          </button>
        </div>
      </article>

      <h2 className="detail-section-label">Komentari</h2>
      <div className="reply-list">
        {replies.map((reply) => (
          <article className={`reply-card${reply.parentId ? ' child' : ''}`} key={reply.id}>
            <div className="reply-main">
              <strong>{reply.author}</strong>
              <p>{reply.content}</p>
              <div className="reply-footer">
                <span>{reply.timeAgo || post.mahala}</span>
                <button type="button" onClick={openDownloadGate}>Odgovori</button>
                <span><MessageCircle size={13} /> {reply.comments}</span>
              </div>
            </div>
            <div className="reply-vote-rail" aria-label="Glasanje za komentar">
              <button type="button" className="reply-vote-badge" onClick={openDownloadGate}>
                <ChevronUp size={15} />
                <strong>{reply.votes}</strong>
              </button>
              <button type="button" className="reply-vote-badge" onClick={openDownloadGate}>
                <ChevronDown size={15} />
              </button>
            </div>
          </article>
        ))}
        {replies.length === 0 && (
          <div className="reply-empty-state">
            Ova objava nema komentara. Budi prvi koji ce pokrenuti diskusiju.
          </div>
        )}
      </div>

      <div className="detail-composer-bar">
        <button type="button" className="detail-composer-gate" onClick={openDownloadGate}>
          <MessageCircle size={17} />
          Komentarisi u aplikaciji
        </button>
      </div>

      <DownloadGateModal open={downloadGateOpen} onClose={() => setDownloadGateOpen(false)} />
    </section>
  );
}
