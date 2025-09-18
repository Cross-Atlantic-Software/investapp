"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, AuthApiError, RegisterRequest, LoginRequest, VerifyEmailRequest, CompleteProfileRequest, AuthResponse, GoogleAuthRequest } from '@/lib/api/auth';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string; // Computed from first_name + last_name
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  verifyEmail: (data: VerifyEmailRequest) => Promise<void>;
  completeProfile: (data: CompleteProfileRequest) => Promise<AuthResponse>;
  googleAuth: () => Promise<void>;
  googleTokenVerify: (data: GoogleAuthRequest) => Promise<AuthResponse & { needsProfileCompletion?: boolean; isNewUser?: boolean }>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && !!token;

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved auth data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const clearError = () => setError(null);

  const login = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authApi.login(data);
      
      if (response.status && response.token && response.data) {
        setToken(response.token);
        const userData = {
          id: response.data.id.toString(),
          email: response.data.email,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          name: response.data.first_name && response.data.last_name 
            ? `${response.data.first_name} ${response.data.last_name}`.trim()
            : response.data.first_name || response.data.last_name || response.data.email.split('@')[0],
        };
        
        setUser(userData);
        
        // Save to localStorage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof AuthApiError 
        ? error.message 
        : 'An unexpected error occurred during login';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authApi.register(data);
      
      if (!response.status) {
        throw new Error(response.message || 'Registration failed');
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof AuthApiError 
        ? error.message 
        : 'An unexpected error occurred during registration';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (data: VerifyEmailRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authApi.verifyEmail(data);
      
      if (!response.status) {
        throw new Error(response.message || 'Email verification failed');
      }
    } catch (error) {
      const errorMessage = error instanceof AuthApiError 
        ? error.message 
        : 'An unexpected error occurred during email verification';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeProfile = async (data: CompleteProfileRequest): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authApi.completeProfile(data);
      
      if (!response.status) {
        throw new Error(response.message || 'Profile completion failed');
      }
      
      // If the response includes user data and token, update auth state
      if (response.token && response.data) {
        setToken(response.token);
        const userData = {
          id: response.data.id.toString(),
          email: response.data.email,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          name: response.data.first_name && response.data.last_name 
            ? `${response.data.first_name} ${response.data.last_name}`.trim()
            : response.data.first_name || response.data.last_name || response.data.email.split('@')[0],
        };
        setUser(userData);
        
        // Save to localStorage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof AuthApiError 
        ? error.message 
        : 'An unexpected error occurred during profile completion';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authApi.googleAuth();
      
      if (response.authUrl) {
        // Redirect to Google OAuth URL
        window.location.href = response.authUrl;
      } else {
        throw new Error('Failed to get Google OAuth URL');
      }
    } catch (error) {
      const errorMessage = error instanceof AuthApiError 
        ? error.message 
        : 'An unexpected error occurred during Google authentication';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleTokenVerify = async (data: GoogleAuthRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authApi.googleTokenVerify(data);
      
      if (response.status && response.token && response.data) {
        setToken(response.token);
        const userData = {
          id: response.data.id.toString(),
          email: response.data.email,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          name: response.data.first_name && response.data.last_name 
            ? `${response.data.first_name} ${response.data.last_name}`.trim()
            : response.data.first_name || response.data.last_name || response.data.email.split('@')[0],
        };
        
        setUser(userData);
        
        // Save to localStorage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(userData));

        // Return the response with profile completion status
        return response;
      } else {
        throw new Error(response.message || 'Google authentication failed');
      }
    } catch (error) {
      const errorMessage = error instanceof AuthApiError 
        ? error.message 
        : 'An unexpected error occurred during Google authentication';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    verifyEmail,
    completeProfile,
    googleAuth,
    googleTokenVerify,
    logout,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
