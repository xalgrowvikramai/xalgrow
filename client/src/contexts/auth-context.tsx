import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  getCurrentUser, 
  loginWithEmail as firebaseLoginWithEmail,
  registerWithEmail as firebaseRegisterWithEmail,
  loginWithGoogle as firebaseLoginWithGoogle,
  logoutUser as firebaseLogout
} from '@/lib/firebase';
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
    // For development/testing - provide a mock user to bypass authentication
    const setupMockUser = () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: new Date(),
      };
      
      console.log('Using mock user for development:', mockUser);
      setUser(mockUser);
      setLoading(false);
    };
    
    // Skip actual authentication and use mock user
    setupMockUser();
    
    // Original authentication code (commented out for now)
    /*
    const checkAuth = async () => {
      try {
        setLoading(true);
        const firebaseUser = await getCurrentUser();
        
        if (firebaseUser) {
          try {
            // Get user data from backend
            const response = await apiRequest('GET', '/api/auth/me');
            if (response.ok) {
              const userData = await response.json();
              setUser(userData);
            } else {
              // If the server doesn't recognize us, try to authenticate with firebase
              const idToken = await firebaseUser.getIdToken();
              const fbResponse = await fetch('/api/auth/firebase-login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken }),
              });
              
              if (fbResponse.ok) {
                const userData = await fbResponse.json();
                setUser(userData);
              } else {
                setUser(null);
              }
            }
          } catch (err) {
            console.error('Failed to get user data from server', err);
            setUser(null);
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
    */
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // For development/testing - skip actual authentication
      console.log('Dev mode: Bypassing actual login with Firebase');
      
      // Create mock user with provided email
      const mockUser = {
        id: 1,
        username: email.split('@')[0],
        email: email,
        displayName: email.split('@')[0],
        createdAt: new Date(),
      };
      
      setUser(mockUser);
      
      toast({
        title: "Login successful",
        description: "Welcome back! (Development Mode)",
      });
      
      /*
      // Use Firebase for authentication
      await firebaseLoginWithEmail(email, password);
      
      // Get user data from backend
      const response = await apiRequest('GET', '/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
      */
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
      
      // For development/testing - skip actual registration
      console.log('Dev mode: Bypassing actual registration with Firebase');
      
      // Create mock user with provided info
      const mockUser = {
        id: 1,
        username: username,
        email: email,
        displayName: username,
        createdAt: new Date(),
      };
      
      setUser(mockUser);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created (Development Mode)",
      });
      
      /*
      // Use Firebase for registration
      await firebaseRegisterWithEmail(email, password);
      
      // Additional registration with our backend is handled in firebaseRegisterWithEmail
      
      // Get user data from backend
      const response = await apiRequest('GET', '/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
      */
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
      
      // For development/testing - skip actual Google authentication
      console.log('Dev mode: Bypassing actual Google login with Firebase');
      
      // Create mock user with Google-like info
      const mockUser = {
        id: 1,
        username: 'googleuser',
        email: 'google-user@example.com',
        displayName: 'Google User',
        photoURL: 'https://lh3.googleusercontent.com/a/default-user',
        createdAt: new Date(),
      };
      
      setUser(mockUser);
      
      toast({
        title: "Login successful",
        description: "You've been signed in with Google (Development Mode)",
      });
      
      /*
      // Use Firebase for Google authentication
      await firebaseLoginWithGoogle();
      
      // Get user data from backend
      const response = await apiRequest('GET', '/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
      */
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
      
      // For development/testing - skip actual logout
      console.log('Dev mode: Bypassing actual logout from Firebase');
      
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You've been successfully logged out (Development Mode)",
      });
      
      /*
      // Logout from Firebase (which also logs out from our backend)
      await firebaseLogout();
      
      setUser(null);
      */
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
