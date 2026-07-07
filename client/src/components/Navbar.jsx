/**
 * components/Navbar.jsx
 * ----------------------
 * Sticky top navigation bar — only visible when authenticated.
 * Displays: logo, Dashboard link, user greeting, Logout button.
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      {/* Brand */}
      <Link to="/dashboard" className="navbar-brand">
        <span className="navbar-brand-icon">🧠</span>
        <span className="navbar-brand-text">Smart Note Engine</span>
      </Link>

      {/* Right side */}
      <div className="navbar-right">
        {user && (
          <span className="navbar-user">
            Hello, <strong>{user.username}</strong>
          </span>
        )}
        <button
          id="logout-btn"
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
