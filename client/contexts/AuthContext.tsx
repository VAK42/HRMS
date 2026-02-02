'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setToken, removeToken, getToken } from '@/lib/api';
import { User, ApiResponse } from '@/lib/types';
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth Must Be Used Within AuthProvider');
  return context;
};
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = getToken();
    if (token) {
      api.get<ApiResponse<{ user: User; employee: unknown }>>('/auth/profile')
        .then(res => {
          if (res.data) {
            setUser({ ...res.data.user, employee: res.data.employee as User['employee'] });
          }
        })
        .catch(() => removeToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);
  const login = async (email: string, password: string) => {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { email, password });
    if (res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
    }
  };
  const logout = () => {
    removeToken();
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};