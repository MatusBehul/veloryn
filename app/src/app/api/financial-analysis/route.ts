import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('Financial analysis API called:', request.url);
  
  try {
    // Check if Firebase Admin is available
    if (!adminDb || !adminAuth) {
      console.error('Firebase Admin not available - adminDb:', !!adminDb, 'adminAuth:', !!adminAuth);
      return NextResponse.json({ error: 'Firebase Admin not available' }, { status: 500 });
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    // console.log('Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header');
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    // console.log('Token length:', token?.length || 0);
    
    // Verify the token and get user ID
    let userId: string;
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      userId = decodedToken.uid;
      console.log('Token verified for user:', userId);
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    console.log(`Fetching analyses - ticker: ${ticker}, fromDate: ${fromDate}, toDate: ${toDate}, limit: ${limit}`);

    try {
      let query = adminDb.collection('financial_analysis');

      // If we have filters, we need to be more careful about indexing
      if (ticker) {
        // Simple ticker filter - order by timestamp
        query = query.where('ticker', '==', ticker.toUpperCase())
      }
      if (fromDate) {
        const fromTimestamp = new Date(fromDate);
        query = query.where('timestamp', '>=', fromTimestamp);
      }

      if (toDate) {
        const toTimestamp = new Date(toDate);
        toTimestamp.setHours(23, 59, 59, 999);
        query = query.where('timestamp', '<=', toTimestamp);
      }

      query = query.orderBy('timestamp', 'desc').limit(limit);
      
      const snapshot = await query.get();
      let analyses = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().timestamp || doc.data().created_at || new Date(),
      }));

      console.log(`Found ${analyses.length} analyses`);

      return NextResponse.json({ 
        analyses
      });

    } catch (queryError) {
      console.error('Error querying financial analysis:', queryError);
      return NextResponse.json({ 
        error: 'Failed to fetch analyses',
        details: queryError instanceof Error ? queryError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in financial analysis API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Firebase Admin is available
    if (!adminDb || !adminAuth) {
      return NextResponse.json({ error: 'Firebase Admin not available' }, { status: 500 });
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and get user ID
    let userId: string;
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      userId = decodedToken.uid;
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { symbol, analysisData } = await request.json();

    if (!symbol || !analysisData) {
      return NextResponse.json({ error: 'Missing required fields: symbol and analysisData' }, { status: 400 });
    }

    // Create new analysis document
    const analysisDoc = await adminDb.collection('financial_analysis').add({
      userId,
      symbol,
      analysisData,
      createdAt: new Date(),
    });

    return NextResponse.json({ 
      id: analysisDoc.id,
      message: 'Analysis saved successfully' 
    });
  } catch (error) {
    console.error('Error saving financial analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
