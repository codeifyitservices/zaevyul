import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // First check local session
      const stored = sessionStorage.getItem('zae_admin');
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
      }
      
      // Sync with backend / verification
      try {
        const profile = await api.auth.me();
        if (profile) {
          sessionStorage.setItem('zae_admin', JSON.stringify(profile));
          setUser(profile);
        } else {
          sessionStorage.removeItem('zae_admin');
          setUser(null);
        }
      } catch (err) {
        // Safe check failed or offline fallback
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const session = await api.auth.login(email, password);
    sessionStorage.setItem('zae_admin', JSON.stringify(session));
    setUser(session);
    return session;
  };

  const logout = async () => {
    await api.auth.logout();
    sessionStorage.removeItem('zae_admin');
    setUser(null);
  };

  const can = (roles) => user && (Array.isArray(roles) ? roles.includes(user.role) : user.role === roles);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
