import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  fullName: string | null;
  phone: string | null;
}

interface AuthContextType extends AuthState {
  login: (token: string, fullName: string, phone: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    isAuthenticated: !!sessionStorage.getItem('token'),
    fullName: sessionStorage.getItem('fullName'),
    phone: sessionStorage.getItem('phone'),
  }));

  const login = useCallback((token: string, fullName: string, phone: string) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('fullName', fullName);
    sessionStorage.setItem('phone', phone);
    setState({ isAuthenticated: true, fullName, phone });
  }, []);

  const logout = useCallback(() => {
    sessionStorage.clear();
    setState({ isAuthenticated: false, fullName: null, phone: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
