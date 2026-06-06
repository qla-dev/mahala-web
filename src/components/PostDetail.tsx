import { useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  MessageCircle,
  Shield,
} from 'lucide-react';
import type { Post, PostReply } from '../types';
import { DownloadGateModal } from './DownloadPrompt';

export default function PostDetail({
  post,
  fallbackReplies = [],
  onBack,
}: {
  post: Post;
  fallbackReplies?: PostReply[];
  onBack: () => void;
}) {
  const [downloadGateOpen, setDownloadGateOpen] = useState(false);
  const replies = post.replies.length ? post.replies : fallbackReplies;
  const openDownloadGate = () => setDownloadGateOpen(true);
  const authorInitial = post.author.replace('@', '').trim()[0]?.toUpperCase() || 'M';

  return (
    <section className="detail-panel">
      <button type="button" className="back-button" onClick={onBack}>
        <ChevronLeft size={18} />
        Nazad na objave
      </button>

      <article className="detail-hero-card" style={{ backgroundColor: post.color }}>
        <div className="detail-hero-meta">
          <span className="avatar large detail-avatar">{authorInitial}</span>
          <div>
            <strong>{post.author}</strong>
            <p>{post.mahala} &middot; {post.timeAgo}</p>
          </div>
        </div>

        <span className="detail-hero-topic">{post.topicName || post.topicId}</span>
        <p className="detail-hero-content">{post.content}</p>

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

        <div className="detail-action-row">
          <button type="button" className="detail-action-pill" onClick={openDownloadGate}>
            <MessageCircle size={15} />
            {post.comments} komentara
          </button>
          <button type="button" className="detail-action-pill" onClick={openDownloadGate}>
            <Shield size={15} />
            Drot
          </button>
        </div>
      </article>

      <h2 className="detail-section-label">Komentari {post.comments}</h2>
      <div className="reply-list">
        {replies.map((reply) => (
          <article className="reply-card" key={reply.id}>
            <div className="reply-main">
              <strong>{reply.author}</strong>
              <p>{reply.content}</p>
              <div className="reply-footer">
                <span>{post.mahala}</span>
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
      </div>

      <button type="button" className="detail-composer-gate" onClick={openDownloadGate}>
        <MessageCircle size={17} />
        Komentarisi u aplikaciji
      </button>

      <DownloadGateModal open={downloadGateOpen} onClose={() => setDownloadGateOpen(false)} />
    </section>
  );
}
