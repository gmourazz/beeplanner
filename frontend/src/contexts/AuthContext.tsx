import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, profession?: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bp_token');
    if (token) {
      api.get('/auth/me').then(r => setUser(r.data.user ?? r.data)).catch(() => localStorage.removeItem('bp_token')).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const r = await api.post('/auth/login', { email, password: pass });
    localStorage.setItem('bp_token', r.data.token);
    setUser(r.data.user);
  };

  const register = async (name: string, email: string, pass: string, profession = 'default') => {
    const r = await api.post('/auth/register', { name, email, password: pass, profession });
    localStorage.setItem('bp_token', r.data.token);
    setUser(r.data.user);
  };

  const logout = () => { localStorage.removeItem('bp_token'); setUser(null); };
  const updateUser = (data: Partial<User>) => setUser(prev => prev ? { ...prev, ...data } : prev);

  return <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
