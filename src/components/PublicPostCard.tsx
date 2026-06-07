import { useState } from 'react';
import type { MouseEvent } from 'react';
import { Bell, Eye, MessageCircle, X } from 'lucide-react';
import { DownloadGateModal } from './DownloadPrompt';
import PublicVoteRail from './PublicVoteRail';

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
  isImage?: boolean;
  imageUri?: string | null;
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
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [downloadGateOpen, setDownloadGateOpen] = useState(false);
  const author = post.author.startsWith('@') ? post.author : `@${post.author}`;
  const isImagePost = Boolean(post.isImage && post.imageUri);
  const openImagePreview = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setImagePreviewOpen(true);
  };
  const openDownloadGate = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setDownloadGateOpen(true);
  };

  return (
    <>
      <article
        className={`public-post-card ${isImagePost ? 'image-post' : ''} ${active ? 'active' : ''}`}
        style={isImagePost ? undefined : { backgroundColor: post.color }}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
          }
        }}
      >
        {isImagePost ? (
          <span
            aria-hidden="true"
            className="public-post-image-bg"
            style={{ backgroundImage: `url("${post.imageUri}")` }}
          />
        ) : null}
      <span className="public-post-meta">
        <span>{post.mahala}</span>
        <span>-</span>
        <span>{post.topicName || post.topicId}</span>
        <span>-</span>
        <span>{post.timeAgo}</span>
      </span>
      <span className="public-post-content"><strong>{author}</strong> {post.content}</span>
        <span className="public-post-footer">
          <button type="button" className="public-post-pill" onClick={(event) => event.stopPropagation()}>
            <MessageCircle size={13} />
            {post.comments} komentara
          </button>
          <button type="button" className="public-post-pill" onClick={(event) => event.stopPropagation()}>
            <Bell size={13} />
            Drot
          </button>
          {isImagePost ? (
            <button type="button" className="public-post-pill" onClick={openImagePreview}>
              <Eye size={13} />
              Pogledaj sliku
            </button>
          ) : null}
        </span>
        <PublicVoteRail
          upvotes={post.upvotes}
          downvotes={post.downvotes}
          onClick={openDownloadGate}
        />
      </article>
      <DownloadGateModal open={downloadGateOpen} onClose={() => setDownloadGateOpen(false)} />
      {isImagePost && imagePreviewOpen ? (
        <div className="image-preview-layer" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
          <button type="button" className="image-preview-backdrop" onClick={() => setImagePreviewOpen(false)} aria-label="Zatvori sliku" />
          <img src={post.imageUri || ''} alt="" className="image-preview-img" />
          <button type="button" className="image-preview-close" onClick={() => setImagePreviewOpen(false)} aria-label="Zatvori sliku">
            <X size={20} />
          </button>
        </div>
      ) : null}
    </>
  );
}
