import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api/client';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nexora_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nexora_access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('nexora_access_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
          localStorage.setItem('nexora_user', JSON.stringify(res.data.data));
        } catch {
          // Token invalid or expired
          setUser(null);
          setToken(null);
          localStorage.removeItem('nexora_access_token');
          localStorage.removeItem('nexora_user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: userData, accessToken } = res.data.data;

      setUser(userData);
      setToken(accessToken);
      localStorage.setItem('nexora_user', JSON.stringify(userData));
      localStorage.setItem('nexora_access_token', accessToken);

      showToast(`Welcome back, ${userData.name}!`, 'success');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to login';
      showToast(message, 'error');
      throw err;
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    try {
      const res = await api.post('/auth/register', data);
      const { user: userData, accessToken } = res.data.data;

      setUser(userData);
      setToken(accessToken);
      localStorage.setItem('nexora_user', JSON.stringify(userData));
      localStorage.setItem('nexora_access_token', accessToken);

      showToast('Account registered successfully! Welcome to Nexora.', 'success');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed';
      showToast(message, 'error');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('nexora_user');
      localStorage.removeItem('nexora_access_token');
      showToast('Logged out of Nexora.', 'info');
    }
  };

  const updateUser = (updated: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const newUser = { ...prev, ...updated };
      localStorage.setItem('nexora_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        updateUser
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
