import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

interface FavoriteTicker {
  symbol: string;
  name?: string;
  dailyUpdates: boolean;
}

// Tier-based limits for favorite tickers
const TICKER_LIMITS = {
  free: 0,
  standard: 5,
  premium: 20,
  vip: 50,        // Future-proofing
  ultimate: 100   // Future-proofing
} as const;

type SubscriptionTier = keyof typeof TICKER_LIMITS;

function getTierLimit(tier: string): number {
  const normalizedTier = tier.toLowerCase() as SubscriptionTier;
  return TICKER_LIMITS[normalizedTier] || TICKER_LIMITS.free;
}

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

    // Try to get user document from Firestore
    if (adminDb) {
      try {
        const userDoc = await adminDb.collection('users').doc(uid).get();
        
        if (!userDoc.exists) {
          // Return empty state for new users
          return NextResponse.json({
            favoriteTickers: [],
            tierInfo: {
              currentTier: 'free',
              limit: TICKER_LIMITS.free,
              used: 0,
              remaining: TICKER_LIMITS.free
            }
          });
        }

        const userData = userDoc.data();
        const favoriteTickers = userData?.favoriteTickers || [];
        const subscriptionTier = userData?.subscriptionTier || 'free';
        
        const limit = getTierLimit(subscriptionTier);
        const used = favoriteTickers.length;
        const remaining = Math.max(0, limit - used);

        return NextResponse.json({
          favoriteTickers,
          tierInfo: {
            currentTier: subscriptionTier,
            limit,
            used,
            remaining
          }
        });
      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
        
        // Fallback response when Firestore is not available
        return NextResponse.json({
          favoriteTickers: [],
          tierInfo: {
            currentTier: 'free',
            limit: TICKER_LIMITS.free,
            used: 0,
            remaining: TICKER_LIMITS.free
          },
          isFirestoreAvailable: false
        });
      }
    } else {
      console.error('Firebase Admin DB not available');
      
      // Fallback response when Firestore is not available
      return NextResponse.json({
        favoriteTickers: [],
        tierInfo: {
          currentTier: 'free',
          limit: TICKER_LIMITS.free,
          used: 0,
          remaining: TICKER_LIMITS.free
        },
        isFirestoreAvailable: false
      });
    }
  } catch (error) {
    console.error('Error fetching favorite tickers:', error);
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

    // Get user document to check subscription tier
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const userTier = userData?.subscriptionTier || 'free';
    const maxTickers = getTierLimit(userTier);

    const body = await request.json();
    const { favoriteTickers } = body;

    // Validate the tickers data
    if (!Array.isArray(favoriteTickers)) {
      return NextResponse.json({ error: 'Invalid tickers data' }, { status: 400 });
    }

    // Check tier-based limits
    if (favoriteTickers.length > maxTickers) {
      return NextResponse.json({ 
        error: `Tier limit exceeded. ${userTier.toUpperCase()} tier allows maximum ${maxTickers} favorite tickers. You are trying to save ${favoriteTickers.length}.`,
        tierLimit: maxTickers,
        currentTier: userTier,
        requestedCount: favoriteTickers.length
      }, { status: 403 });
    }

    // Validate each ticker object
    for (const ticker of favoriteTickers) {
      if (!ticker.symbol || typeof ticker.symbol !== 'string') {
        return NextResponse.json({ error: 'Invalid ticker symbol' }, { status: 400 });
      }
      
      if (typeof ticker.dailyUpdates !== 'boolean') {
        return NextResponse.json({ error: 'Invalid dailyUpdates value' }, { status: 400 });
      }
    }

    // Update user document with favorite tickers
    await adminDb.collection('users').doc(uid).update({
      favoriteTickers,
      updatedAt: new Date(),
    });

    console.log(`✅ Updated favorite tickers for user ${uid}: ${favoriteTickers.length}/${maxTickers} tickers (${userTier} tier)`);

    return NextResponse.json({ 
      success: true, 
      message: 'Favorite tickers updated successfully',
      favoriteTickers,
      tierInfo: {
        currentTier: userTier,
        limit: maxTickers,
        used: favoriteTickers.length,
        remaining: maxTickers - favoriteTickers.length
      }
    });
  } catch (error) {
    console.error('Error updating favorite tickers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
