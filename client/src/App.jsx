/**
 * App.jsx
 * --------
 * Root component — wraps the app in AuthProvider and configures React Router.
 *
 * Routes:
 *   /           → Landing Page   (public — 3D landing with CTA)
 *   /login      → Login page     (public)
 *   /register   → Register page  (public)
 *   /dashboard  → Dashboard      (protected — requires auth token)
 *   /graph/:id  → GraphView      (protected — requires auth token)
 *
 * <ProtectedRoute> redirects unauthenticated users to /login.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Dashboard   from './pages/Dashboard';
import GraphView   from './pages/GraphView';
import Navbar      from './components/Navbar';

// ── Protected Route Guard ────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ── Authenticated Layout (Navbar + page) ────────────────────────────────────
function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

// ── Router ───────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/graph/:id"
        element={
          <ProtectedRoute>
            <AppLayout><GraphView /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
