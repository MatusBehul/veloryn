import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface IntegrationRequest {
  email?: string;
  audience?: string;
  origin?: string;
  keyName?: string;
}

interface IntegrationResponse {
  success: boolean;
  message: string;
  email: string;
  data?: any;
}

export function useIntegration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { firebaseUser } = useAuth();

  const executeIntegration = async (request: IntegrationRequest = {}): Promise<IntegrationResponse | null> => {
    // Check if integration is enabled
    if (process.env.NEXT_PUBLIC_ENABLE_INTEGRATION !== 'true') {
      console.log('🔇 Integration disabled, skipping execution');
      return { success: false, message: 'Integration disabled', data: null };
    }

    setLoading(true);
    setError(null);

    console.log('useIntegration: Starting integration with firebaseUser:', !!firebaseUser, firebaseUser?.email);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if user is authenticated
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
          console.log('useIntegration: Added auth token for user:', firebaseUser.email);
        } catch (tokenError) {
          console.warn('Failed to get auth token, continuing without authentication:', tokenError);
        }
      } else {
        console.log('useIntegration: No firebaseUser, continuing as anonymous');
      }

      const response = await fetch('/api/integration/execute', {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Integration failed');
      }

      console.log('Integration executed successfully:', data);
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Integration error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    executeIntegration,
    loading,
    error,
  };
}
