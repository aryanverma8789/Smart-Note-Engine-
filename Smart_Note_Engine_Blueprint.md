# Project Blueprint: Smart Note Engine with Network Graph

## 1. System Architecture & Directory Structure

This project follows a standard MERN stack (MongoDB, Express, React, Node.js) layered architecture, strictly separating concerns.

### Backend (`/server`)
*   `server.js`: The application entry point. Initializes Express, binds middleware, and starts the server.
*   `config/db.js`: Handles the connection string and instantiation of the MongoDB connection.
*   `models/`: Defines the data schema and models.
    *   `Note.js`: Schema for notes (title, content, tags, linked notes).
    *   `User.js`: Schema for users (for authentication).
*   `controllers/`: Contains the core business logic and algorithms.
    *   `noteController.js`: CRUD operations for notes, plus logic for finding connections.
    *   `searchController.js`: The custom Trie implementation for O(L) tag searching.
    *   `authController.js`: Handles login, registration, and token generation.
*   `routes/`: Maps HTTP endpoints to specific controller functions.
    *   `noteRoutes.js`
    *   `authRoutes.js`
*   `middleware/`: Intercepts requests for validation and security.
    *   `authMiddleware.js`: Validates JWTs.
    *   `securityMiddleware.js`: Rate limiting and Helmet configs.
*   `data_structures/`: Custom algorithm implementations to showcase DSA knowledge.
    *   `Trie.js`: Class definition for the prefix tree.
    *   `Graph.js`: Logic for BFS traversal of note connections.

### Frontend (`/client`)
*   `src/index.js` / `main.jsx`: React entry point.
*   `src/App.jsx`: Main routing component (React Router).
*   `src/components/`: Reusable UI elements.
    *   `Editor.jsx`: The text area for writing notes.
    *   `TagInput.jsx`: The input field that interacts with the autocomplete API.
    *   `NoteCard.jsx`: Display component for a single note.
*   `src/pages/`: High-level page views.
    *   `Dashboard.jsx`: Lists all notes.
    *   `GraphView.jsx`: Renders the visual network of connected notes.
    *   `Login.jsx` / `Register.jsx`
*   `src/services/`: API client configuration.
    *   `api.js`: Axios configuration, including base URLs and injecting auth tokens into headers.

---

## 2. Database Schema Design (MongoDB)

Since notes are inherently unstructured and frequently linked, MongoDB (a NoSQL document database) is ideal. We use references to link documents.

### Collection: `Users`
*   `_id`: ObjectId (Auto-generated)
*   `username`: String (Unique, Indexed)
*   `email`: String (Unique, Indexed)
*   `passwordHash`: String (Bcrypt hashed)
*   `createdAt`: Date

### Collection: `Notes`
*   `_id`: ObjectId (Auto-generated)
*   `userId`: ObjectId (Reference to `Users`) - Crucial for separating user data.
*   `title`: String (Indexed for text search)
*   `content`: String (The body of the note)
*   `tags`: Array of Strings (e.g., `["DSA", "React", "Interview"]`)
*   `links`: Array of ObjectIds (References to other `Notes` in the same collection. This is the **edges** of your graph).
*   `createdAt`: Date
*   `updatedAt`: Date

*Note on the "Graph":* In a graph, each note document is a **Node**. The `links` array represents the **Edges** (specifically, directed edges, though you can treat them as bi-directional in the application logic).

---

## 3. Seamless Development Workflow

To prevent context switching, build the foundation first, then the backend logic, and finally the frontend visualization.

### Phase 1: Database & Core Models
**Goal:** Establish where and how data is stored.
*   **Step 1:** Initialize the Node project (`npm init`) and install dependencies (Express, Mongoose, dotenv).
*   **Step 2:** Create `config/db.js` to connect to a local MongoDB or MongoDB Atlas instance.
*   **Step 3:** Define `models/User.js` and `models/Note.js` using Mongoose schemas as detailed above.

### Phase 2: Security & Authentication (The 5-Layer Foundation)
**Goal:** Secure the application before adding core features.
*   **Step 1:** Create `controllers/authController.js` to handle password hashing (bcrypt) and user registration.
*   **Step 2:** Implement login logic to generate a short-lived JWT Access Token.
*   **Step 3:** Create `middleware/authMiddleware.js` to protect future routes by verifying the JWT.
*   **Step 4:** Set up `routes/authRoutes.js` and bind them to the server. Test via Postman.

### Phase 3: The CRUD API & Base Logic
**Goal:** Enable basic note creation, reading, updating, and deleting.
*   **Step 1:** Create `controllers/noteController.js`. Write functions to `createNote`, `getNotes`, `updateNote`, and `deleteNote`. Ensure every query filters by `req.user.id` (from the auth middleware) so users only see their own notes.
*   **Step 2:** Implement the logic in `createNote` to handle the `links` array (connecting notes to one another).
*   **Step 3:** Create `routes/noteRoutes.js`, apply the `authMiddleware`, and link to the controller. Test via Postman.

### Phase 4: Implementing the DSA Components (The Interview Highlights)
**Goal:** Build the custom data structures that make this project unique.
*   **Step 1 (The Trie):** Create `data_structures/Trie.js`. Write methods for `insert(word)` and `searchPrefix(prefix)`.
*   **Step 2 (Autocomplete Controller):** Create `controllers/searchController.js`. On server startup, load all unique user tags into the Trie. Create an endpoint `/api/tags/suggest?q=...` that queries the Trie for O(L) time complexity tag suggestions.
*   **Step 3 (The Graph):** Create `data_structures/Graph.js`. Implement a Breadth-First Search (BFS) function.
*   **Step 4 (Graph Controller):** In `noteController.js`, create an endpoint `/api/notes/:id/network`. Use the BFS logic to find all notes connected to a specific note up to a certain depth (e.g., 2 degrees of separation) to feed the frontend visualization.

### Phase 5: Frontend Foundation & Integration
**Goal:** Build the user interface and connect it to the secure API.
*   **Step 1:** Initialize a React app (Vite or CRA). Set up React Router in `App.jsx`.
*   **Step 2:** Build `services/api.js` using Axios, configured to automatically attach the JWT from local storage to outgoing requests.
*   **Step 3:** Build the Auth views (`Login.jsx`, `Register.jsx`) and connect them to the backend.

### Phase 6: Frontend Features & Visualization
**Goal:** Bring the notes and the graph to life.
*   **Step 1:** Build the `Dashboard.jsx` to fetch and display the user's notes using `NoteCard.jsx`.
*   **Step 2:** Build the `Editor.jsx`. Integrate the `TagInput.jsx` to fetch autocomplete suggestions from your Trie endpoint as the user types.
*   **Step 3:** Build `GraphView.jsx`. Use a library like `react-force-graph` or `vis-network`. Fetch the data from your `/api/notes/:id/network` endpoint and map the notes as nodes and the `links` array as edges to draw the network graph.

### Phase 7: Deployment (CI/CD)
**Goal:** Push the project to production.
*   **Step 1:** Write the `Dockerfile` for the backend.
*   **Step 2:** Create the GitHub Actions YAML file to run standard tests (if written) on push.
*   **Step 3:** Deploy the database (MongoDB Atlas), the Backend (Render/Railway), and the Frontend (Vercel/Netlify). Update environment variables accordingly.
