/**
 * context/AuthContext.jsx
 * ------------------------
 * React Context providing authentication state to the entire app.
 *
 * State:
 *   - token  : JWT string from localStorage
 *   - user   : { _id, username, email } object
 *
 * Methods:
 *   - login(token, user)  : Persists token + user, updates state
 *   - logout()            : Clears localStorage + state, redirects to /login
 *
 * Hook: useAuth() — consume auth state anywhere in the tree
 */

import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'sne_token';
const USER_KEY  = 'sne_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user,  setUser]  = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  /** Called after successful login/register — persists session */
  const login = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  /** Clears all session data */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = { token, user, login, logout, isAuthenticated: !!token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Custom hook for consuming auth context */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
  return ctx;
}
