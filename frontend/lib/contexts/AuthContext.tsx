"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, AuthApiError, RegisterRequest, LoginRequest, VerifyEmailRequest, CompleteProfileRequest, AuthResponse } from '@/lib/api/auth';

interface User {
  id: string;
  email: string;
  name?: string;
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
        setUser({
          id: response.data.id.toString(),
          email: response.data.email,
        });
        
        // Save to localStorage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify({
          id: response.data.id.toString(),
          email: response.data.email,
        }));
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
