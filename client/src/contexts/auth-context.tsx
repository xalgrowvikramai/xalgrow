import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, getCurrentUser } from '@/lib/firebase';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const firebaseUser = await getCurrentUser();
        
        if (firebaseUser) {
          // Get user data from backend
          const response = await apiRequest('GET', '/api/auth/me');
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        setError('Authentication check failed');
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      const userData = await response.json();
      
      setUser(userData);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (err: any) {
      setError(err.message || 'Login failed');
      toast({
        title: "Login failed",
        description: err.message || "Check your credentials and try again",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('POST', '/api/auth/register', { 
        username, 
        email, 
        password 
      });
      const userData = await response.json();
      
      setUser(userData);
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      toast({
        title: "Registration failed",
        description: err.message || "Please try again with different credentials",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Google authentication would typically be handled by Firebase
      // and then verified on the backend
      toast({
        title: "Google login",
        description: "Google authentication is being processed",
      });
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      toast({
        title: "Google login failed",
        description: err.message || "Please try again",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiRequest('POST', '/api/auth/logout');
      setUser(null);
      toast({
        title: "Logged out",
        description: "You've been successfully logged out",
      });
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      toast({
        title: "Logout failed",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
