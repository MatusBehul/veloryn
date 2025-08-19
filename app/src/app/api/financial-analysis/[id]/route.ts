import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Missing analysis ID' }, { status: 400 });
    }

    // Get the analysis document directly by ID
    const analysisDoc = await adminDb.collection('financial_analysis').doc(id).get();

    if (!analysisDoc.exists) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    const analysisData = analysisDoc.data();
    
    // Fetch all subdocuments from the 'data' collection
    const dataCollectionRef = adminDb.collection('financial_analysis').doc(id).collection('data');
    const dataSnapshot = await dataCollectionRef.get();
    
    const structuredData: any = {
      id: analysisDoc.id,
      ticker: analysisData?.ticker || 'Unknown',
      date: analysisData?.date || analysisData?.timestamp || analysisData?.created_at || new Date().toISOString(),
      createdAt: analysisData?.timestamp || analysisData?.created_at || new Date().toISOString(),
    };

    // Process each document in the data collection
    dataSnapshot.docs.forEach((doc: any) => {
      const docData = doc.data();
      structuredData[doc.id] = docData;
    });

    return NextResponse.json(structuredData);
  } catch (error) {
    console.error('Error fetching financial analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
