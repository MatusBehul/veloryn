import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  console.log('Test auth API called:', request.url);
  
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Missing or invalid authorization header',
        authHeaderPresent: !!authHeader,
        authHeaderValue: authHeader ? authHeader.substring(0, 20) + '...' : null
      }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('Token extracted, length:', token?.length);
    
    // Check if adminAuth is available
    if (!adminAuth) {
      console.error('Firebase Admin Auth not available');
      return NextResponse.json({ 
        error: 'Firebase Admin not configured',
        adminAuthAvailable: false
      }, { status: 500 });
    }
    
    console.log('AdminAuth available, verifying token...');
    
    // Verify the token
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      console.log('Token verified successfully for uid:', decodedToken.uid);
      
      return NextResponse.json({ 
        success: true,
        uid: decodedToken.uid,
        adminAuthAvailable: true,
        tokenLength: token.length,
        message: 'Authentication successful'
      });
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return NextResponse.json({ 
        error: 'Invalid or expired token',
        tokenError: tokenError instanceof Error ? tokenError.message : 'Unknown token error',
        adminAuthAvailable: true
      }, { status: 401 });
    }
    
  } catch (error) {
    console.error('General error in test-auth:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
