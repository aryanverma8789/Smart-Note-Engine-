# AGENT_RULES.md - Smart Note Engine Project

**Project Blueprint Reference:** `Smart_Note_Engine_Blueprint.md`

This file contains persistent rules for all specialized agents working on the project.

---

## General Rules (All Agents)

- **Project Goal**: Build a full-stack Smart Note Engine with note linking, tag autocomplete (Trie), and network graph visualization (BFS).
- **Stack**: MERN (MongoDB, Express, React, Node.js)
- **Strict Separation of Concerns**:
  - Backend agent → ONLY `/server` folder
  - Database agent → ONLY schemas, models, and DB logic
  - Frontend agent → ONLY `/client` folder
- Always read the latest version of `Smart_Note_Engine_Blueprint.md` before starting work.
- Follow the 7-phase development workflow exactly as described in the blueprint.
- Use clean, well-commented, production-ready code.
- Maintain consistency in code style, naming conventions, and error handling.
- After every major change, verify functionality (run server, tests, linting, etc.).
- Report progress clearly with "PHASE X COMPLETE" when a phase is finished.
- Only ask for human intervention on blockers, phase transitions, or critical decisions.
- Never overwrite or edit files outside your assigned domain.

---

## Agent 1: Backend-Opus (Claude Opus 4.6)

**Role**: Exclusive owner of all backend development.

**Responsibilities**:
- Implement complete `/server` structure as defined in the blueprint.
- Handle Express server setup, middleware, routes, controllers.
- Implement authentication (JWT + bcrypt).
- CRUD operations for notes with proper user isolation (`userId`).
- Custom DSA implementations:
  - Trie for fast tag autocomplete (`/api/tags/suggest`).
  - Graph BFS for note network (`/api/notes/:id/network`).
- Security: Rate limiting, Helmet, auth middleware on protected routes.
- Always filter all note operations by `req.user.id`.

**Looping Instruction**:
Follow the Backend looping prompt. Work strictly phase by phase (Phase 1 → 4). After completing backend phases, support frontend integration by clarifying API contracts.

---

## Agent 2: DB-Gemini (Gemini Pro 3.1)

**Role**: Database Schema & Model Expert.

**Responsibilities**:
- Design and maintain perfect MongoDB schemas for `Users` and `Notes`.
- Define Mongoose models with proper:
  - Validation
  - Indexing (title, tags, userId)
  - References (`userId`, `links` array)
  - Timestamps
  - Virtuals / Populate support for graph relationships
- Provide connection configuration (`config/db.js`).
- Ensure data integrity for the note-linking graph feature.
- Write helper queries or seed data if needed.

**Looping Instruction**:
Focus exclusively on schema perfection and model files. Finalize early so Backend-Opus can build on top. Revisit only if new requirements emerge.

**Final Output Marker**: "DATABASE SCHEMA FINALIZED"

---

## Agent 3: Frontend-Sonnet (Claude Sonnet 4.6)

**Role**: Exclusive owner of all frontend development.

**Responsibilities**:
- Implement complete `/client` React application.
- Set up React Router, Axios with auth token interceptor.
- Build components: Editor with live tag autocomplete, NoteCard, etc.
- Pages: Dashboard, GraphView (using react-force-graph or vis-network), Auth pages.
- Connect seamlessly to backend APIs.
- Focus on great UX, responsiveness, and visual appeal of the network graph.

**Looping Instruction**:
Start after backend APIs are ready. Follow Phase 5 and 6 from the blueprint. Use the Trie endpoint for tag suggestions and the network endpoint for graph rendering.

---

## Coordination Protocol

1. DB-Gemini finishes first → Backend-Opus builds server.
2. Backend-Opus completes core APIs → Frontend-Sonnet builds UI.
3. Agents may review each other’s work when explicitly asked.
4. Keep this `AGENT_RULES.md` file updated with any new decisions (ports, env variables, library choices, etc.).

**Current Status Tracking**:
- Database: Finalized
- Backend: Phase 1 Complete
- Frontend: Phase 5 & 6 Complete

---

**Success Criteria**:
- Fully functional authenticated note-taking app.
- Working tag autocomplete (Trie).
- Interactive network graph showing linked notes (BFS).
- Clean, maintainable, well-documented codebase.

Last Updated: 2026-07-06