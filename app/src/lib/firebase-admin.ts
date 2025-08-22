import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Check if we're in a build environment and skip Firebase initialization
const isBuilding = process.env.NODE_ENV === 'production' && !process.env.FIREBASE_PROJECT_ID;

console.log("------------")
console.log(process.env)
console.log("------------")

let app: any = null;
let adminDb: any = null;
let adminAuth: any = null;

if (!isBuilding) {
  try {
    // Debug logging for production
    if (process.env.NODE_ENV === 'production') {
      console.log('Initializing Firebase Admin...');
      console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set');
      console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not set');
      console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'Set (length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : 'Not set');
    }

    const firebaseAdminConfig = {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    };

    if (getApps().length === 0) {
      app = initializeApp(firebaseAdminConfig);
      console.log('Firebase Admin initialized successfully');
    } else {
      app = getApps()[0];
      console.log('Using existing Firebase Admin app');
    }

    adminDb = getFirestore(app);
    adminAuth = getAuth(app);
    
    if (process.env.NODE_ENV === 'production') {
      console.log('Firebase Admin services initialized:', {
        db: !!adminDb,
        auth: !!adminAuth
      });
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    // In production, we still want to export something to avoid import errors
    adminDb = null;
    adminAuth = null;
  }
} else {
  console.log('Skipping Firebase Admin initialization during build');
}

export { adminDb, adminAuth };
export default app;
