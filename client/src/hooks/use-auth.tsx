import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useLocation } from "wouter";

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Verificar se o usuário está autenticado através de uma chamada à API
    // que dependerá do cookie HttpOnly
    verifyAuthentication();
  }, []);

  const verifyAuthentication = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        credentials: 'include' // Importante para incluir cookies
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Authentication verification failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newUser: User) => {
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: 'include'
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    }
    
    setUser(null);
    setLocation("/login");
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}