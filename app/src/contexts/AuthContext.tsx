'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to ensure user profile exists in integration platform
  const ensureIntegrationProfile = async (token: string, email: string) => {
    // Check if integration is enabled
    if (process.env.NEXT_PUBLIC_ENABLE_INTEGRATION !== 'true') {
      console.log('🔇 Integration disabled, skipping profile creation');
      return;
    }

    try {
      console.log('Ensuring integration profile for:', email);
      
      const response = await fetch('/api/integration/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          audience: 'customer',
          origin: 'default',
          keyName: 'ckey'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Integration profile result:', result.action, result.message);
      } else {
        console.warn('Failed to ensure integration profile:', response.status);
      }
    } catch (error) {
      console.warn('Error ensuring integration profile (non-critical):', error);
      // Don't throw - this shouldn't block the login process
    }
  };

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      console.warn('Firebase auth not available, setting loading to false');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user data with subscription info
        try {
          const token = await firebaseUser.getIdToken();
          const response = await fetch('/api/user', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            
            // Ensure user profile exists in integration platform
            await ensureIntegrationProfile(token, firebaseUser.email!);
          } else {
            console.error('Error fetching user data');
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase auth not available');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase auth not available');
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase auth not available');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase auth not available');
    await signOut(auth);
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
