import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Primary brand colors
const COLORS = {
  primary: "#1976d2",
  secondary: "#ff9800",
  accent: "#e91e63",
  background: "#fafbfc",
  border: "#e9ecef"
};

// PUBLIC_INTERFACE
function App() {
  // Note shape: { id:string, title:string, content:string, created:timestamp, updated:timestamp }
  const [notes, setNotes] = useState(() => {
    // Demo data on first load
    return [
      {
        id: "1",
        title: "Welcome to Notes!",
        content: "This is your very first note.",
        created: Date.now(),
        updated: Date.now()
      }
    ];
  });
  const [selectedId, setSelectedId] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const mainInputRef = useRef();

  // Filter/search logic for notes
  const filteredNotes = searchTerm
    ? notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : notes;

  // Select newly created note automatically
  useEffect(() => {
    if (editingNote && editingNote.id && !selectedId) setSelectedId(editingNote.id);
  }, [editingNote, selectedId]);

  // Focus main pane input on start of edit
  useEffect(() => {
    if (mainInputRef.current) mainInputRef.current.focus();
  }, [editingNote]);

  // PUBLIC_INTERFACE
  function handleSelectNote(id) {
    setSelectedId(id);
    setEditingNote(null);
  }

  // PUBLIC_INTERFACE
  function handleNewNote() {
    const id = Date.now().toString();
    const newNote = {
      id,
      title: "",
      content: "",
      created: Date.now(),
      updated: Date.now()
    };
    setNotes((n) => [newNote, ...n]);
    setSelectedId(id);
    setEditingNote({ ...newNote });
  }

  // PUBLIC_INTERFACE
  function handleEditNote(id) {
    const note = notes.find((n) => n.id === id);
    if (note) {
      setEditingNote({ ...note });
      setSelectedId(id);
    }
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(id) {
    setNotes((n) => n.filter((note) => note.id !== id));
    if (selectedId === id) {
      // Select next, or fallback to the first remaining note
      const other = notes.find((note) => note.id !== id);
      setSelectedId(other ? other.id : "");
      setEditingNote(null);
    }
  }

  // PUBLIC_INTERFACE
  function handleSaveEdit() {
    setNotes((prevNotes) =>
      prevNotes.map((n) =>
        n.id === editingNote.id
          ? {
              ...editingNote,
              title: editingNote.title.trim() || "Untitled",
              updated: Date.now()
            }
          : n
      )
    );
    setEditingNote(null);
  }

  // PUBLIC_INTERFACE
  function handleCancelEdit() {
    setEditingNote(null);
  }

  // PUBLIC_INTERFACE
  function handleUpdateEditField(event) {
    const { name, value } = event.target;
    setEditingNote((n) => ({ ...n, [name]: value }));
  }

  // Get viewable note
  const selectedNote = notes.find((n) => n.id === selectedId);

  return (
    <div className="notes-app-root" data-theme="light">
      {/* Sidebar for note list & new/search buttons */}
      <aside className="notes-sidebar">
        <div className="brand-header">
          <span className="brand-dot" />
          <span className="brand-name">Notes</span>
        </div>
        <button className="btn primary-btn" onClick={handleNewNote}>
          + New Note
        </button>
        <input
          className="search-input"
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search notes"
        />
        <nav className="notes-list" aria-label="Notes list">
          {filteredNotes.length === 0 && (
            <div className="no-notes">No notes found.</div>
          )}
          {filteredNotes.map((note) => (
            <NoteListItem
              key={note.id}
              note={note}
              isActive={note.id === selectedId}
              onClick={() => handleSelectNote(note.id)}
              onEdit={() => handleEditNote(note.id)}
              onDelete={() => handleDeleteNote(note.id)}
            />
          ))}
        </nav>
      </aside>
      {/* Main Pane: Show note/editor */}
      <main className="note-main">
        {editingNote ? (
          <div className="note-editor">
            <input
              className="note-title-input"
              name="title"
              placeholder="Title"
              value={editingNote.title}
              onChange={handleUpdateEditField}
              ref={mainInputRef}
              aria-label="Note Title"
              maxLength={100}
              autoFocus
            />
            <textarea
              className="note-content-input"
              name="content"
              placeholder="Type your note here..."
              value={editingNote.content}
              onChange={handleUpdateEditField}
              aria-label="Note Content"
              rows={10}
              maxLength={2000}
            />
            <div className="editor-actions">
              <button
                className="btn accent-btn"
                onClick={handleSaveEdit}
                disabled={
                  editingNote.title.trim() === "" &&
                  editingNote.content.trim() === ""
                }
              >
                Save
              </button>
              <button
                className="btn"
                onClick={handleCancelEdit}
                style={{ marginLeft: 8 }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : selectedNote ? (
          <div className="note-view">
            <div className="note-view-header">
              <h2 className="note-view-title">{selectedNote.title}</h2>
              <div>
                <button
                  className="btn secondary-btn"
                  onClick={() => handleEditNote(selectedNote.id)}
                  aria-label="Edit note"
                >
                  Edit
                </button>
                <button
                  className="btn"
                  style={{ color: COLORS.accent, marginLeft: 8 }}
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  aria-label="Delete note"
                >
                  Delete
                </button>
              </div>
            </div>
            <pre className="note-view-content">
              {selectedNote.content || <span className="faded">No content</span>}
            </pre>
            <div className="note-view-meta">
              <span>
                Created: {dateFmt(selectedNote.created)}&nbsp;&middot;&nbsp;Last
                updated: {dateFmt(selectedNote.updated)}
              </span>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <h2>Select or create a note</h2>
            <p>Your notes will appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
function NoteListItem({ note, isActive, onClick, onEdit, onDelete }) {
  return (
    <div
      className={"note-list-item" + (isActive ? " active" : "")}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onClick(); }}
      role="button"
      aria-label={`Select note: ${note.title}`}
    >
      <span className="note-item-title">
        {note.title.trim().length > 0 ? note.title : <span className="faded">Untitled</span>}
      </span>
      <div className="note-list-actions">
        <button
          className="icon-btn"
          title="Edit"
          aria-label="Edit"
          onClick={e => { e.stopPropagation(); onEdit(); }}
        >
          ✎
        </button>
        <button
          className="icon-btn"
          title="Delete"
          aria-label="Delete"
          onClick={e => { e.stopPropagation(); onDelete(); }}
        >
          🗑
        </button>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function dateFmt(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default App;
