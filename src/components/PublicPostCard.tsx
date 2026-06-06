import { Bell, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

type PublicPost = {
  id: string;
  topicId: string;
  topicName?: string;
  author: string;
  mahala: string;
  content: string;
  timeAgo: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  color: string;
};

export default function PublicPostCard({
  post,
  active,
  onClick,
}: {
  key?: string;
  post: PublicPost;
  active: boolean;
  onClick: () => void;
}) {
  const author = post.author.startsWith('@') ? post.author : `@${post.author}`;

  return (
    <button
      type="button"
      className={`public-post-card ${active ? 'active' : ''}`}
      style={{ backgroundColor: post.color }}
      onClick={onClick}
    >
      <span className="public-post-meta">
        <span>{post.mahala}</span>
        <span>-</span>
        <span>{author}</span>
        <span>-</span>
        <span>{post.timeAgo}</span>
      </span>
      <span className="public-post-topic">{post.topicName || post.topicId}</span>
      <span className="public-post-content">{post.content}</span>
      <span className="public-post-footer">
        <span className="public-post-pill">
          <MessageCircle size={13} />
          {post.comments} komentara
        </span>
        <span className="public-post-pill">
          <Bell size={13} />
          Drot
        </span>
      </span>
      <span className="public-post-votes">
        <span className="public-vote-badge">
          <ChevronUp size={18} />
          <strong>{post.upvotes}</strong>
        </span>
        <span className="public-vote-badge">
          <strong>{post.downvotes}</strong>
          <ChevronDown size={18} />
        </span>
      </span>
    </button>
  );
}
