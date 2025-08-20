import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Debug logging
console.log('Firebase config status:', {
  env: process.env,
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

// Check if we have the required config
const hasFirebaseConfig = !!(firebaseConfig.apiKey && 
                            firebaseConfig.authDomain && 
                            firebaseConfig.projectId);

if (!hasFirebaseConfig) {
  console.error('Firebase config missing:', {
    apiKey: !!firebaseConfig.apiKey,
    authDomain: !!firebaseConfig.authDomain,
    projectId: !!firebaseConfig.projectId
  });
  console.error('Make sure all NEXT_PUBLIC_FIREBASE_* environment variables are set');
}

// Lazy initialization to prevent issues during build
let app: any = null;
let auth: any = null;
let db: any = null;

export function getFirebaseApp() {
  if (!app) {
    try {
      if (getApps().length === 0) {
        app = initializeApp({
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        });
      } else {
        app = getApps()[0];
      }
    } catch (error) {
      console.warn('Firebase app initialization failed:', error);
    }
  }
  return app;
}

export function getFirebaseAuth() {
  if (!auth && typeof window !== 'undefined' && hasFirebaseConfig) {
    try {
      const app = getFirebaseApp();
      if (app) {
        auth = getAuth(app);
        console.log('Firebase auth initialized successfully');
      } else {
        console.warn('Firebase app not available for auth initialization');
      }
    } catch (error) {
      console.warn('Firebase auth initialization failed:', error);
    }
  } else if (!hasFirebaseConfig && typeof window !== 'undefined') {
    console.warn('Firebase config missing:', {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
  }
  return auth;
}

export function getFirebaseDb() {
  if (!db && typeof window !== 'undefined' && hasFirebaseConfig) {
    try {
      const app = getFirebaseApp();
      if (app) {
        db = getFirestore(app);
      }
    } catch (error) {
      console.warn('Firebase db initialization failed:', error);
    }
  }
  return db;
}

// For backward compatibility, but only initialize on client
export { getFirebaseAuth as auth, getFirebaseDb as db };
export default getFirebaseApp;
