import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileRequest {
  email?: string;
  audience?: string;
  origin?: string;
  keyName?: string;
}

interface ProfileResponse {
  success: boolean;
  message: string;
  profile?: any;
  action: 'found' | 'created';
  email?: string;
}

export function useProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { firebaseUser } = useAuth();

  const ensureProfile = async (request: ProfileRequest = {}): Promise<ProfileResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      if (!firebaseUser) {
        throw new Error('User must be authenticated to manage profile');
      }

      const token = await firebaseUser.getIdToken();

      const response = await fetch('/api/integration/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Profile management failed');
      }

      console.log('Profile management result:', data);
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Profile management error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    ensureProfile,
    loading,
    error,
  };
}
