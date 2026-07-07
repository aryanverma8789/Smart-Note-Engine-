/**
 * pages/Dashboard.jsx
 * --------------------
 * Main notes listing page.
 *
 * Features:
 *   - Fetches all user notes on mount via notesAPI.getAll()
 *   - Client-side search filtering by title and tags
 *   - Floating Action Button opens blank Editor to create a note
 *   - Click a NoteCard to edit it
 *   - Delete button removes note (with confirmation)
 *   - Responsive grid layout
 */

import { useState, useEffect, useMemo } from 'react';
import { notesAPI } from '../services/api';
import NoteCard from '../components/NoteCard';
import Editor   from '../components/Editor';

export default function Dashboard() {
  const [notes,       setNotes]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState(null);  // null = closed, false = new, object = edit
  const [showEditor,  setShowEditor]  = useState(false);

  // ── Fetch notes ───────────────────────────────────────────────────
  const fetchNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await notesAPI.getAll();
      setNotes(data.notes || data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not load notes — ensure the backend server is running on port 5000.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  // ── Client-side filtering ─────────────────────────────────────────
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [notes, searchQuery]);

  // ── Handlers ──────────────────────────────────────────────────────
  const openCreate = () => { setEditingNote(null); setShowEditor(true); };
  const openEdit   = (note) => { setEditingNote(note); setShowEditor(true); };
  const closeEditor = () => { setShowEditor(false); setEditingNote(null); };

  const handleSave = (saved) => {
    setNotes((prev) => {
      const exists = prev.find((n) => n._id === saved._id);
      return exists
        ? prev.map((n) => (n._id === saved._id ? saved : n))
        : [saved, ...prev];
    });
    closeEditor();
  };

  const handleDelete = async (id) => {
    try {
      await notesAPI.delete(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch {
      alert('Failed to delete note. Please try again.');
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      <main className="page" id="dashboard">
        {/* Header row */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            My Notes
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '1rem', marginLeft: 10 }}>
              {notes.length > 0 && `(${filteredNotes.length})`}
            </span>
          </h1>

          {/* Search */}
          <div className="search-bar">
            <span className="search-bar-icon" aria-hidden>🔍</span>
            <input
              id="search-input"
              type="text"
              className="form-input"
              placeholder="Search notes, tags…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search notes"
            />
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="auth-error" style={{ marginBottom: 24 }} role="alert">
            ⚠️ {error}
          </div>
        )}

        {/* Notes grid */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner" aria-label="Loading notes" />
            <span>Loading your notes…</span>
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.length === 0 ? (
              <div className="empty-state" id="empty-state">
                <div className="empty-state-icon">📝</div>
                <h3>
                  {searchQuery ? 'No notes match your search' : 'No notes yet'}
                </h3>
                <p>
                  {searchQuery
                    ? 'Try a different keyword or tag.'
                    : 'Click the + button to create your first note.'}
                </p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        id="create-note-fab"
        className="fab"
        onClick={openCreate}
        title="New note"
        aria-label="Create new note"
      >
        +
      </button>

      {/* Editor Modal */}
      {showEditor && (
        <Editor
          note={editingNote}
          allNotes={notes}
          onSave={handleSave}
          onClose={closeEditor}
        />
      )}
    </>
  );
}
