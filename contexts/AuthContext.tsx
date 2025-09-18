/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { API_URL } from '../config';

// Backend'den gelecek kullanıcı tipini tanımla
export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  faculty?: string;
  department?: string;
  classYear?: string;
  themeColor?: string;
  profilePictureUrl?: string;
  points?: number;
  token?: string; // login sonrası access_token
}

// Context tipi
interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    faculty: string;
    department: string;
    classYear: string;
  }, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfilePicture: (url: string) => void;
  fetchUserProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 🔹 Backend'e login isteği
  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      if (!res.ok) throw new Error('Login failed');

      const data = await res.json();

      const userData = {
        ...data.user,
        token: data.access_token,
      };
      setCurrentUser(userData);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  // 🔹 Backend'e register isteği
  const register = async (userData: {
    firstName: string;
    lastName: string;
    faculty: string;
    department: string;
    classYear: string;
  }, email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          faculty: userData.faculty,
          department: userData.department,
          classYear: userData.classYear
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Register failed');
      }

      const data = await res.json();

      const userData = {
        ...data.user,
        token: data.access_token,
      };
      setCurrentUser(userData);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err) {
      console.error('Register error:', err);
      throw err;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateProfilePicture = (url: string) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, profilePictureUrl: url });
    }
  };

  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUser({ ...userData, token });
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Update user profile
  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setCurrentUser({ ...updatedUser, token });
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, login, register, logout, updateProfilePicture, fetchUserProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
