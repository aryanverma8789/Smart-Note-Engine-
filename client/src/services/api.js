/**
 * services/api.js
 * ----------------
 * Axios instance pre-configured for the Smart Note Engine API.
 *
 * - Base URL points to the Express server (port 5000).
 * - Request interceptor: attaches JWT Bearer token from localStorage.
 * - Response interceptor: on 401, clears auth state + redirects to /login.
 *
 * Exported API modules:
 *   authAPI  — register, login
 *   notesAPI — CRUD + network (BFS graph)
 *   tagsAPI  — Trie autocomplete suggestions
 */

import axios from 'axios';

// ── Axios Instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor: Inject JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sne_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle 401 Unauthorised ───────────────────────────
// Only auto-redirect on 401 for PROTECTED routes (not login/register themselves)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthRoute) {
      // Token expired or invalid on a protected route → force re-login
      localStorage.removeItem('sne_token');
      localStorage.removeItem('sne_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth API ────────────────────────────────────────────────────────────────
export const authAPI = {
  /** POST /api/auth/register — { username, email, password } */
  register: (data) => api.post('/auth/register', data),

  /** POST /api/auth/login — { email, password } → { token, user } */
  login: (data) => api.post('/auth/login', data),
};

// ── Notes API ───────────────────────────────────────────────────────────────
export const notesAPI = {
  /** GET /api/notes — returns all notes for the authenticated user */
  getAll: () => api.get('/notes'),

  /** GET /api/notes/:id — single note detail */
  getOne: (id) => api.get(`/notes/${id}`),

  /** POST /api/notes — { title, content, tags, links } */
  create: (data) => api.post('/notes', data),

  /** PUT /api/notes/:id — partial update */
  update: (id, data) => api.put(`/notes/${id}`, data),

  /** DELETE /api/notes/:id */
  delete: (id) => api.delete(`/notes/${id}`),

  /**
   * GET /api/notes/:id/network
   * Returns BFS-traversed note network: { nodes: [...], links: [...] }
   * Used by GraphView.jsx to render the force-directed graph.
   */
  getNetwork: (id) => api.get(`/notes/${id}/network`),
};

// ── Tags API ────────────────────────────────────────────────────────────────
export const tagsAPI = {
  /**
   * GET /api/tags/suggest?q=<prefix>
   * Queries the Trie data structure for O(L) tag autocomplete suggestions.
   * Returns: { suggestions: ['DSA', 'Design', ...] }
   */
  suggest: (prefix) => api.get('/tags/suggest', { params: { q: prefix } }),
};

export default api;
