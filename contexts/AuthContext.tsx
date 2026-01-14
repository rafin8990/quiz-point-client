"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, getAuthToken, setAuthToken, removeAuthToken } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrMobile: string, password: string, isEmail?: boolean) => Promise<void>;
  register: (data: {
    name: string;
    email?: string;
    mobile?: string;
    password: string;
    image?: File;
    address?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.me();
      setUser(response.user);
    } catch (error) {
      // Token is invalid, remove it
      removeAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrMobile: string, password: string, isEmail: boolean = true) => {
    try {
      const credentials = isEmail
        ? { email: emailOrMobile, password }
        : { mobile: emailOrMobile, password };

      const response = await authApi.login(credentials);
      setAuthToken(response.token);
      setUser(response.user);
      router.push('/dashboard');
    } catch (error: any) {
      throw error;
    }
  };

  const register = async (data: {
    name: string;
    email?: string;
    mobile?: string;
    password: string;
    image?: File;
    address?: string;
  }) => {
    try {
      const response = await authApi.register(data);
      setAuthToken(response.token);
      setUser(response.user);
      router.push('/dashboard');
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      removeAuthToken();
      setUser(null);
      router.push('/login');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user ? ['admin', 'super_admin'].includes(user.role) : false,
    isSuperAdmin: user ? user.role === 'super_admin' : false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
