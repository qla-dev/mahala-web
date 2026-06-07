import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function ImagePreviewOverlay({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  return createPortal(
    <div className="image-preview-layer" role="dialog" aria-modal="true">
      <button type="button" className="image-preview-backdrop" onClick={onClose} aria-label="Zatvori sliku" />
      <img src={src} alt="" className="image-preview-img" />
      <button type="button" className="image-preview-close" onClick={onClose} aria-label="Zatvori sliku">
        <X size={20} />
      </button>
    </div>,
    document.body,
  );
}
