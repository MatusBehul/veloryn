'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFirebaseDb } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface UserGlossaryState {
  viewedTerms: string[]; // Array of term IDs that user has viewed
  lastUpdated: Date;
}

interface UseGlossaryReturn {
  isTermViewed: (termId: string) => boolean;
  markTermAsViewed: (termId: string) => void;
  getUnviewedTermsCount: () => number;
  resetViewedTerms: () => void;
  loading: boolean;
}

export const useGlossary = (): UseGlossaryReturn => {
  const { user, firebaseUser } = useAuth();
  const [glossaryState, setGlossaryState] = useState<UserGlossaryState>({
    viewedTerms: [],
    lastUpdated: new Date()
  });
  const [loading, setLoading] = useState(true);

  // Load user's glossary state from Firestore
  const loadGlossaryState = useCallback(async () => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    try {
      const db = getFirebaseDb();
      if (!db) {
        setLoading(false);
        return;
      }
      
      const docRef = doc(db, 'users', firebaseUser.uid, 'preferences', 'glossary');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGlossaryState({
          viewedTerms: data.viewedTerms || [],
          lastUpdated: data.lastUpdated?.toDate() || new Date()
        });
      } else {
        // Initialize with default state
        const defaultState: UserGlossaryState = {
          viewedTerms: [],
          lastUpdated: new Date()
        };
        
        await setDoc(docRef, {
          ...defaultState,
          lastUpdated: defaultState.lastUpdated
        });
        
        setGlossaryState(defaultState);
      }
    } catch (error) {
      console.error('Error loading glossary state:', error);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  // Save glossary state to Firestore
  const saveGlossaryState = useCallback(async (newState: Partial<UserGlossaryState>) => {
    if (!firebaseUser) return;

    try {
      const db = getFirebaseDb();
      if (!db) return;
      
      const docRef = doc(db, 'users', firebaseUser.uid, 'preferences', 'glossary');
      const updateData = {
        ...newState,
        lastUpdated: new Date()
      };
      
      await updateDoc(docRef, updateData);
      
      setGlossaryState(prev => ({
        ...prev,
        ...updateData,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Error saving glossary state:', error);
      // Try to create the document if it doesn't exist
      try {
        const db = getFirebaseDb();
        if (!db) return;
        
        const docRef = doc(db, 'users', firebaseUser.uid, 'preferences', 'glossary');
        await setDoc(docRef, {
          viewedTerms: [],
          ...newState,
          lastUpdated: new Date()
        });
        
        setGlossaryState(prev => ({
          ...prev,
          ...newState,
          lastUpdated: new Date()
        }));
      } catch (createError) {
        console.error('Error creating glossary document:', createError);
      }
    }
  }, [firebaseUser]);

  // Check if a term has been viewed
  const isTermViewed = useCallback((termId: string): boolean => {
    return glossaryState.viewedTerms.includes(termId);
  }, [glossaryState.viewedTerms]);

  // Mark a term as viewed
  const markTermAsViewed = useCallback((termId: string) => {
    if (!isTermViewed(termId)) {
      const newViewedTerms = [...glossaryState.viewedTerms, termId];
      saveGlossaryState({ viewedTerms: newViewedTerms });
    }
  }, [glossaryState.viewedTerms, isTermViewed, saveGlossaryState]);

  // Get count of unviewed terms
  const getUnviewedTermsCount = useCallback((): number => {
    // This would need to import GLOSSARY_TERMS, but we'll keep it simple
    // In a real implementation, you might want to pass the total terms count
    return Math.max(0, 50 - glossaryState.viewedTerms.length); // Assuming ~50 terms
  }, [glossaryState.viewedTerms]);

  // Reset all viewed terms
  const resetViewedTerms = useCallback(() => {
    saveGlossaryState({ viewedTerms: [] });
  }, [saveGlossaryState]);

  // Load state on mount and when user changes
  useEffect(() => {
    loadGlossaryState();
  }, [loadGlossaryState]);

  // For non-logged in users, use local state
  useEffect(() => {
    if (!firebaseUser) {
      // Use localStorage for non-authenticated users
      try {
        const savedState = localStorage.getItem('veloryn_glossary_state');
        if (savedState) {
          const parsed = JSON.parse(savedState);
          setGlossaryState({
            viewedTerms: parsed.viewedTerms || [],
            lastUpdated: new Date(parsed.lastUpdated || Date.now())
          });
        }
      } catch (error) {
        console.error('Error loading local glossary state:', error);
      }
      setLoading(false);
    }
  }, [firebaseUser]);

  // Save to localStorage for non-authenticated users
  useEffect(() => {
    if (!firebaseUser && !loading) {
      try {
        localStorage.setItem('veloryn_glossary_state', JSON.stringify(glossaryState));
      } catch (error) {
        console.error('Error saving local glossary state:', error);
      }
    }
  }, [glossaryState, firebaseUser, loading]);

  return {
    isTermViewed,
    markTermAsViewed,
    getUnviewedTermsCount,
    resetViewedTerms,
    loading
  };
};
