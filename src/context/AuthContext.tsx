import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { storageService } from '../services/storageService';
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  onAuthChange,
  isFirebaseConfigured,
} from '../lib/firebase';

interface AuthContextType {
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
  login: (emailOrId: string, password?: string) => Promise<boolean> | boolean;
  signup: (name: string, email: string, role?: UserRole, title?: string, password?: string) => Promise<boolean> | boolean;
  logout: () => void;
  loginAsPersona: (userId: string) => void;
  updateUserRole: (userId: string, newRole: UserRole, title?: string) => void;
  addMember: (name: string, email: string, role: UserRole, title?: string, password?: string) => User;
  removeMember: (userId: string) => void;
  isAuthenticated: boolean;
  role: UserRole;
  isAdmin: boolean;
  isManager: boolean;
  isMember: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [currentUserId, setCurrentUserId] = useState<string>(() => storageService.getCurrentUserId());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => storageService.getIsAuthenticated());

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  // Listen to Firebase Authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        // If a Firebase user is logged in, sync with local session
        const existing = users.find((u) => u.email.toLowerCase() === (firebaseUser.email || '').toLowerCase());
        if (existing) {
          setCurrentUserId(existing.id);
          setIsAuthenticated(true);
          storageService.setCurrentUserId(existing.id);
          storageService.setIsAuthenticated(true);
        } else if (firebaseUser.email) {
          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            role: 'member',
            organizationIds: ['org-acme'],
            createdAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
          };
          const updated = [...users, newUser];
          setUsers(updated);
          storageService.saveUsers(updated);
          setCurrentUserId(newUser.id);
          setIsAuthenticated(true);
          storageService.setCurrentUserId(newUser.id);
          storageService.setIsAuthenticated(true);
        }
      }
    });

    return () => unsubscribe();
  }, [users]);

  const switchUser = (userId: string) => {
    storageService.setCurrentUserId(userId);
    setCurrentUserId(userId);
  };

  const loginAsPersona = (userId: string) => {
    const freshUsers = storageService.getUsers();
    setUsers(freshUsers);
    storageService.setCurrentUserId(userId);
    storageService.setIsAuthenticated(true);
    setCurrentUserId(userId);
    setIsAuthenticated(true);
  };

  const login = async (emailOrId: string, password?: string): Promise<boolean> => {
    if (!emailOrId.trim()) {
      throw new Error('Email or user identifier is required.');
    }

    // 1. Try Firebase Authentication first if configured
    if (isFirebaseConfigured && password && emailOrId.includes('@')) {
      try {
        const firebaseUser = await signInWithEmail(emailOrId.trim(), password);
        if (firebaseUser) {
          setIsAuthenticated(true);
          storageService.setIsAuthenticated(true);
          return true;
        }
      } catch {
        // Firebase rejected or user not provisioned in cloud auth — fall through to local workspace directory
      }
    }

    // 2. Local / Provisioned workspace credential validation
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const foundUser = users.find(
      (u) => u.id === emailOrId.trim() || u.email.toLowerCase() === emailOrId.trim().toLowerCase()
    );

    if (foundUser) {
      // If user has a specific password configured, enforce it; otherwise accept valid password (default konvey123)
      if (foundUser.password && foundUser.password !== password) {
        throw new Error('Invalid email or password.');
      }
      storageService.setCurrentUserId(foundUser.id);
      storageService.setIsAuthenticated(true);
      setCurrentUserId(foundUser.id);
      setIsAuthenticated(true);
      return true;
    }

    // Strictly reject unrecognized credentials
    throw new Error('Invalid email or password.');
  };

  const signup = async (
    name: string,
    email: string,
    _role?: UserRole, // Ignore client-supplied role to prevent privilege self-assignment
    title: string = 'Team Member',
    password?: string
  ): Promise<boolean> => {
    if (!name.trim() || !email.trim()) {
      throw new Error('Name and email are required.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    let createdUid: string | null = null;
    if (isFirebaseConfigured && password) {
      try {
        const fbUser = await signUpWithEmail(email.trim(), password, name.trim());
        createdUid = fbUser.uid;
      } catch (err: any) {
        throw new Error(err?.message || 'Registration failed.');
      }
    }

    // Enforce least privilege: all new self-registered users are strictly given 'member' role
    const newUser: User = {
      id: createdUid || `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: 'member',
      title: title.trim() || 'Team Member',
      organizationIds: ['org-acme'],
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    storageService.saveUsers(updatedUsers);
    storageService.setCurrentUserId(newUser.id);
    storageService.setIsAuthenticated(true);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    signOutUser().catch(() => {});
    storageService.setIsAuthenticated(false);
    setIsAuthenticated(false);
  };

  const addMember = (name: string, email: string, role: UserRole, title?: string, password?: string): User => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      title: title?.trim() || (role === 'manager' ? 'Project Manager' : role === 'admin' ? 'Administrator' : role === 'client' ? 'Client Executive' : 'Team Member'),
      password: password?.trim() || 'konvey123',
      organizationIds: ['org-roy', 'org-acme'],
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    storageService.saveUsers(updatedUsers);
    return newUser;
  };

  const removeMember = (userId: string) => {
    if (users.length <= 1) return;
    const updatedUsers = users.filter((u) => u.id !== userId);
    setUsers(updatedUsers);
    storageService.saveUsers(updatedUsers);
  };

  const updateUserRole = (userId: string, newRole: UserRole, title?: string) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, role: newRole, title: title !== undefined ? title : u.title } : u));
      storageService.saveUsers(updated);
      return updated;
    });
  };

  useEffect(() => {
    if (currentUser) {
      currentUser.lastActiveAt = new Date().toISOString();
    }
  }, [currentUser]);

  const value: AuthContextType = {
    currentUser,
    users,
    switchUser,
    login,
    signup,
    logout,
    loginAsPersona,
    updateUserRole,
    addMember,
    removeMember,
    isAuthenticated,
    role: currentUser?.role || 'member',
    isAdmin: currentUser?.role === 'admin',
    isManager: currentUser?.role === 'manager' || currentUser?.role === 'admin',
    isMember: currentUser?.role === 'member',
    isClient: currentUser?.role === 'client',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
