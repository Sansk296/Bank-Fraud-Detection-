/**
 * BFS – Bank Fraud Shield
 * Authentication Context & Hook
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; isLocked?: boolean; remainingTime?: string }>;
  register: (data: { name: string; email: string; phone: string; password: string; confirmPassword: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('bfs_auth_token');
    const savedUser = localStorage.getItem('bfs_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify with server profile
        api.getProfile()
          .then(res => {
            if (res.success && res.user) {
              setUser(res.user);
              localStorage.setItem('bfs_user', JSON.stringify(res.user));
            }
          })
          .catch(() => {
            // Token might be expired
            localStorage.removeItem('bfs_auth_token');
            localStorage.removeItem('bfs_user');
            setToken(null);
            setUser(null);
          })
          .finally(() => setLoading(false));
        return;
      } catch {
        localStorage.removeItem('bfs_auth_token');
        localStorage.removeItem('bfs_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('bfs_auth_token', res.token);
        localStorage.setItem('bfs_user', JSON.stringify(res.user));
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Login failed',
        isLocked: err.data?.isLocked,
        remainingTime: err.data?.remainingTime
      };
    }
  };

  const register = async (data: { name: string; email: string; phone: string; password: string; confirmPassword: string }) => {
    try {
      const res = await api.register(data);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('bfs_auth_token', res.token);
        localStorage.setItem('bfs_user', JSON.stringify(res.user));
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    await api.logout();
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.getProfile();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('bfs_user', JSON.stringify(res.user));
      }
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
