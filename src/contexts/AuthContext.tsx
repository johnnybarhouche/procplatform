'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  role: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: { username: string; password: string; rememberMe: boolean; role: string }) => Promise<void>;
  logout: () => void;
  changeRole: (newRole: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token));
        if (decoded.exp > Date.now()) {
          setUser({
            id: decoded.userId,
            username: decoded.username,
            role: decoded.role,
            name: decoded.name || decoded.username,
            email: decoded.email || `${decoded.username}@company.com`
          });
        } else {
          localStorage.removeItem('authToken');
        }
      } catch (err) {
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  const login = async (credentials: { username: string; password: string; rememberMe: boolean; role: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const { token, user: userData } = await response.json();
      // Update user data with selected role
      const userWithRole = { ...userData, role: credentials.role };
      localStorage.setItem('authToken', token);
      setUser(userWithRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (newRole: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/change-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newRole, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Role change failed');
      }

      // Update user role
      if (user) {
        setUser({ ...user, role: newRole });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Role change failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, changeRole, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
