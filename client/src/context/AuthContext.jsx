import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken, setToken, removeToken, decodeToken, isTokenExpired } from '../utils/token';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while reading token on mount

  // On mount: restore user from stored token if still valid
  useEffect(() => {
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      const decoded = decodeToken(token);
      // Restore minimal user info from the token payload
      // Full profile details come from the login/register response stored in state
      setUser({ id: decoded.id });
    } else {
      removeToken();
    }
    setLoading(false);
  }, []);

  /**
   * Call after a successful login or register API response.
   * Stores the token and sets the user state.
   */
  const login = useCallback((token, userData) => {
    setToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy consumption
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
