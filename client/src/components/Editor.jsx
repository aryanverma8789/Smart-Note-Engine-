/**
 * components/Editor.jsx
 * ----------------------
 * Modal for creating or editing a note.
 *
 * Props:
 *   - note       : null (create) | noteObject (edit)
 *   - allNotes   : note[] — full list for the "linked notes" selector
 *   - onSave     : (savedNote) => void
 *   - onClose    : () => void
 */

import { useState, useEffect } from 'react';
import { notesAPI } from '../services/api';
import TagInput from './TagInput';

const emptyForm = { title: '', content: '', tags: [], links: [] };

export default function Editor({ note, allNotes = [], onSave, onClose }) {
  const isEditing = !!note;

  const [form,    setForm]    = useState(emptyForm);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  // Pre-fill when editing
  useEffect(() => {
    if (note) {
      setForm({
        title:   note.title   || '',
        content: note.content || '',
        tags:    note.tags    || [],
        // links may be populated objects or plain IDs
        links: (note.links || []).map((l) => (typeof l === 'object' ? l._id : l)),
      });
    } else {
      setForm(emptyForm);
    }
  }, [note]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleTagChange = (newTags) =>
    setForm((prev) => ({ ...prev, tags: newTags }));

  const toggleLink = (id) =>
    setForm((prev) => ({
      ...prev,
      links: prev.links.includes(id)
        ? prev.links.filter((l) => l !== id)
        : [...prev.links, id],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, title: form.title.trim() };
      const { data } = isEditing
        ? await notesAPI.update(note._id, payload)
        : await notesAPI.create(payload);
      onSave(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note.');
    } finally {
      setSaving(false);
    }
  };

  // Close modal on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Linkable notes = all notes except the one being edited
  const linkableNotes = allNotes.filter((n) => n._id !== note?._id);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-title"
      onClick={handleOverlayClick}
    >
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <h2 id="editor-title" className="modal-title">
            {isEditing ? '✏️ Edit Note' : '📝 New Note'}
          </h2>
          <button
            id="editor-close-btn"
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close editor"
          >
            ×
          </button>
        </div>

        {/* Error */}
        {error && <div className="auth-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="note-title">Title *</label>
              <input
                id="note-title"
                name="title"
                type="text"
                className="form-input"
                placeholder="Note title…"
                value={form.title}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            {/* Content */}
            <div className="form-group">
              <label className="form-label" htmlFor="note-content">Content</label>
              <textarea
                id="note-content"
                name="content"
                className="form-input"
                placeholder="Write your note here…"
                value={form.content}
                onChange={handleChange}
              />
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">Tags</label>
              <TagInput tags={form.tags} onChange={handleTagChange} />
            </div>

            {/* Linked Notes */}
            {linkableNotes.length > 0 && (
              <div className="form-group">
                <label className="form-label">
                  Link to other notes{' '}
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                    (graph edges)
                  </span>
                </label>
                <div className="editor-note-selector">
                  {linkableNotes.map((n) => (
                    <label
                      key={n._id}
                      className="editor-note-option"
                      htmlFor={`link-${n._id}`}
                    >
                      <input
                        id={`link-${n._id}`}
                        type="checkbox"
                        checked={form.links.includes(n._id)}
                        onChange={() => toggleLink(n._id)}
                      />
                      <span>{n.title}</span>
                      {n.tags?.length > 0 && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          · {n.tags.slice(0,3).join(', ')}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="editor-actions">
            <button
              type="button"
              id="editor-cancel-btn"
              className="btn btn-ghost"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="editor-save-btn"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
