import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check if Firebase Admin is available
    if (!adminDb || !adminAuth) {
      return NextResponse.json({ error: 'Firebase Admin not available' }, { status: 500 });
    }

    // Get the authorization header (try both cases for compatibility)
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and get user ID
    let uid: string;
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      uid = decodedToken.uid;
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Get user document from Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      // Auto-create user document for new users
      const userData = {
        id: uid,
        email: null, // Will be populated when user updates profile
        name: null,
        subscriptionStatus: 'inactive',
        favoriteTickers: [], // Initialize empty favorite tickers array
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await adminDb.collection('users').doc(uid).set(userData);
      return NextResponse.json(userData);
    }

    const userData = userDoc.data();
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Firebase Admin is available
    if (!adminDb || !adminAuth) {
      return NextResponse.json({ error: 'Firebase Admin not available' }, { status: 500 });
    }

    // Get the authorization header (try both cases for compatibility)
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and get user ID
    let uid: string;
    try {
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
      favoriteTickers: [], // Initialize empty favorite tickers array
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await adminDb.collection('users').doc(uid).set(userData, { merge: true });

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
