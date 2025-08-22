import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { isLanguageSupported } from '@/lib/languages/manager';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
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

    // Parse request body
    const body = await request.json();
    const { preferredLanguage } = body;

    // Validate language code
    if (!preferredLanguage || typeof preferredLanguage !== 'string') {
      return NextResponse.json({ error: 'Invalid language code' }, { status: 400 });
    }

    if (!isLanguageSupported(preferredLanguage)) {
      return NextResponse.json({ error: 'Unsupported language code' }, { status: 400 });
    }

    // Update user document in Firestore
    if (adminDb) {
      try {
        const userDocRef = adminDb.collection('users').doc(uid);
        
        // Update the user document with the new preferred language
        await userDocRef.update({
          preferredLanguage: preferredLanguage,
          updatedAt: new Date(),
        });

        console.log(`Updated preferred language to ${preferredLanguage} for user ${uid}`);

        return NextResponse.json({ 
          success: true, 
          message: 'Language preference updated successfully',
          preferredLanguage: preferredLanguage
        });

      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
        return NextResponse.json({ error: 'Failed to update language preference' }, { status: 500 });
      }
    } else {
      console.error('Firebase Admin DB not available');
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error updating language preference:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
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

    // Get user document from Firestore
    if (adminDb) {
      try {
        const userDoc = await adminDb.collection('users').doc(uid).get();
        
        if (!userDoc.exists) {
          return NextResponse.json({ preferredLanguage: 'en' }); // Default to English
        }

        const userData = userDoc.data();
        return NextResponse.json({ 
          preferredLanguage: userData?.preferredLanguage || 'en' 
        });

      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
        return NextResponse.json({ error: 'Failed to get language preference' }, { status: 500 });
      }
    } else {
      console.error('Firebase Admin DB not available');
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error getting language preference:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
