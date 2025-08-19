'use client';

import React, { useEffect, useState } from 'react';
import { getFirebaseAuth, getFirebaseApp } from '@/lib/firebase';

export function FirebaseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const app = getFirebaseApp();
      const auth = getFirebaseAuth();
      
      setDebugInfo({
        hasApp: !!app,
        hasAuth: !!auth,
        config: {
          apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        },
        envVars: {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...',
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        }
      });
    }
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded mt-4">
      {/* <h3 className="font-bold mb-2">Firebase Debug Info:</h3>
      <pre className="text-xs overflow-auto">
        {JSON.stringify(debugInfo, null, 2)}
      </pre> */}
    </div>
  );
}
