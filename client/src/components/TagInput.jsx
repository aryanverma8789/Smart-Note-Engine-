/**
 * components/TagInput.jsx
 * ------------------------
 * Controlled tag input with Trie-powered autocomplete.
 *
 * Props:
 *   - tags    : string[]          — current selected tags
 *   - onChange : (tags) => void   — called when tags list changes
 *
 * Behaviour:
 *   - Type to get autocomplete suggestions from /api/tags/suggest (debounced 300ms).
 *   - Click suggestion or press Enter/comma to add tag.
 *   - Click × on a pill to remove it.
 *   - Duplicate tags are silently ignored.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { tagsAPI } from '../services/api';

const DEBOUNCE_MS = 300;

export default function TagInput({ tags = [], onChange }) {
  const [inputVal,     setInputVal]     = useState('');
  const [suggestions,  setSuggestions]  = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);

  // ── Fetch suggestions (debounced) ────────────────────────────────
  const fetchSuggestions = useCallback(async (prefix) => {
    if (!prefix.trim() || prefix.length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    try {
      const { data } = await tagsAPI.suggest(prefix);
      const filtered = (data.suggestions || []).filter((s) => !tags.includes(s));
      setSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } catch {
      // Backend not yet available — silently degrade
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [tags]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(inputVal), DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [inputVal, fetchSuggestions]);

  // ── Close dropdown on outside click ─────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Add a tag ────────────────────────────────────────────────────
  const addTag = (tag) => {
    const cleaned = tag.trim().toLowerCase();
    if (!cleaned || tags.includes(cleaned)) return;
    onChange([...tags, cleaned]);
    setInputVal('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  // ── Remove a tag ─────────────────────────────────────────────────
  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  // ── Keyboard handler ─────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputVal);
    }
    if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
    if (e.key === 'Escape') setShowDropdown(false);
  };

  return (
    <div className="tag-input-wrapper" ref={wrapperRef}>
      <div
        className="tag-input-field"
        role="combobox"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        onClick={() => document.getElementById('tag-text-input')?.focus()}
      >
        {/* Existing tag pills */}
        {tags.map((tag) => (
          <span key={tag} className="tag-pill">
            {tag}
            <button
              type="button"
              className="tag-remove"
              aria-label={`Remove tag ${tag}`}
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
            >
              ×
            </button>
          </span>
        ))}

        {/* Text input */}
        <input
          id="tag-text-input"
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? 'Add tags (Enter or comma)…' : ''}
          aria-label="Tag input"
          autoComplete="off"
        />
      </div>

      {/* Autocomplete dropdown */}
      {showDropdown && (
        <ul
          className="tag-suggestions"
          role="listbox"
          aria-label="Tag suggestions"
        >
          {suggestions.map((s) => (
            <li
              key={s}
              className="tag-suggestion-item"
              role="option"
              onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
