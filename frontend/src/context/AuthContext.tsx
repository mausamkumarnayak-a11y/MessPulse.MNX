import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_CREDENTIALS: Record<UserRole, { email: string; name: string }> = {
  student: { email: 'student@ashoka.edu', name: 'Aarav Sharma' },
  staff: { email: 'staff@ashoka.edu', name: 'Ramesh Kumar (Kitchen Lead)' },
  warden: { email: 'warden@ashoka.edu', name: 'Dr. S. Mukherjee (Warden)' },
  admin: { email: 'admin@ashoka.edu', name: 'Campus Administrator' }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('messpulse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('messpulse_token');
      if (token) {
        try {
          const profile = await api.getCurrentUser();
          setUser(profile);
          localStorage.setItem('messpulse_user', JSON.stringify(profile));
        } catch {
          api.clearToken();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('messpulse_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('messpulse_unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, password = 'Password123!') => {
    const res = await api.login(email, password);
    setUser(res.user);
  };

  const switchRole = async (role: UserRole) => {
    const cred = DEMO_CREDENTIALS[role];
    await login(cred.email, 'Password123!');
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        switchRole,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
