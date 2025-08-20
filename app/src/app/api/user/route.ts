import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header (try both cases for compatibility)
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and get user ID
    let uid: string;
    let firebaseUser: any;
    try {
      // Check if Firebase Admin is available
      if (!adminAuth) {
        console.error('Firebase Admin Auth not available');
        return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
      }
      
      const decodedToken = await adminAuth.verifyIdToken(token);
      uid = decodedToken.uid;
      firebaseUser = decodedToken;
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Try to get user document from Firestore
    if (adminDb) {
      try {
        const userDoc = await adminDb.collection('users').doc(uid).get();
        
        if (!userDoc.exists) {
          // Auto-create user document for new users
          const userData = {
            id: uid,
            email: firebaseUser.email || null,
            name: firebaseUser.name || null,
            subscriptionStatus: 'inactive',
            favoriteTickers: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await adminDb.collection('users').doc(uid).set(userData);
          return NextResponse.json(userData);
        }

        const userData = userDoc.data();
        return NextResponse.json(userData);
      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
        
        // Fallback: return a basic user object based on the Firebase token
        const fallbackUser = {
          id: uid,
          email: firebaseUser.email || null,
          name: firebaseUser.name || null,
          subscriptionStatus: 'inactive',
          favoriteTickers: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isFirestoreAvailable: false
        };
        
        return NextResponse.json(fallbackUser);
      }
    } else {
      console.error('Firebase Admin DB not available');
      
      // Fallback: return a basic user object
      const fallbackUser = {
        id: uid,
        email: firebaseUser.email || null,
        name: firebaseUser.name || null,
        subscriptionStatus: 'inactive',
        favoriteTickers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isFirestoreAvailable: false
      };
      
      return NextResponse.json(fallbackUser);
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header (try both cases for compatibility)
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and get user ID
    let uid: string;
    try {
      if (!adminAuth) {
        console.error('Firebase Admin Auth not available');
        return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
      }
      
      const decodedToken = await adminAuth.verifyIdToken(token);
      uid = decodedToken.uid;
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const body = await request.json();
    const { email, name } = body;

    // Create or update user document
    const userData = {
      id: uid,
      email,
      name: name || null,
      subscriptionStatus: 'inactive',
      favoriteTickers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Try to save to Firestore if available
    if (adminDb) {
      try {
        await adminDb.collection('users').doc(uid).set(userData, { merge: true });
        return NextResponse.json(userData);
      } catch (firestoreError) {
        console.error('Firestore error during user creation:', firestoreError);
        
        // Return the user data even if we couldn't save to Firestore
        return NextResponse.json({
          ...userData,
          isFirestoreAvailable: false,
          warning: 'User data could not be persisted to database'
        });
      }
    } else {
      console.error('Firebase Admin DB not available during user creation');
      return NextResponse.json({
        ...userData,
        isFirestoreAvailable: false,
        warning: 'User data could not be persisted to database'
      });
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
