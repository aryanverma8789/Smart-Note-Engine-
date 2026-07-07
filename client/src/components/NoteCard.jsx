/**
 * components/NoteCard.jsx
 * ------------------------
 * Display card for a single note.
 *
 * Props:
 *   - note      : { _id, title, content, tags, links, createdAt }
 *   - onEdit    : (note) => void   — opens Editor modal
 *   - onDelete  : (id)   => void   — deletes note
 *   - onGraph   : (id)   => void   — navigates to GraphView
 */

import { useNavigate } from 'react-router-dom';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function NoteCard({ note, onEdit, onDelete, onGraph }) {
  const navigate = useNavigate();

  const handleGraphClick = (e) => {
    e.stopPropagation();
    navigate(`/graph/${note._id}`);
    onGraph?.(note._id);
  };

  return (
    <article
      className="card note-card"
      role="button"
      tabIndex={0}
      aria-label={`Open note: ${note.title}`}
      onClick={() => onEdit(note)}
      onKeyDown={(e) => e.key === 'Enter' && onEdit(note)}
    >
      {/* Title */}
      <h3 className="note-card-title">{note.title}</h3>

      {/* Content preview */}
      {note.content && (
        <p className="note-card-content">{note.content}</p>
      )}

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div className="note-card-tags" aria-label="Tags">
          {note.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
          {note.tags.length > 5 && (
            <span className="tag-pill">+{note.tags.length - 5}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="note-card-footer">
        {/* Date + links count */}
        <span>
          {formatDate(note.createdAt)}
          {note.links?.length > 0 && (
            <span className="note-card-links" title="Connected notes">
              &nbsp;· 🔗 {note.links.length}
            </span>
          )}
        </span>

        {/* Action buttons (appear on hover) */}
        <div className="note-card-actions">
          <button
            id={`graph-btn-${note._id}`}
            className="btn btn-ghost btn-icon"
            title="View note network"
            aria-label="View graph"
            onClick={handleGraphClick}
          >
            🕸
          </button>
          <button
            id={`delete-btn-${note._id}`}
            className="btn btn-danger btn-icon"
            title="Delete note"
            aria-label="Delete note"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Delete "${note.title}"?`)) onDelete(note._id);
            }}
          >
            🗑
          </button>
        </div>
      </footer>
    </article>
  );
}
