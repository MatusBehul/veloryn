import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // For security, this endpoint should be called by internal services only
    // You might want to add additional authentication for production
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users who have favorite tickers with daily updates enabled
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.get();
    
    const usersWithTickers: Array<{
      email: string;
      favoriteTickers: Array<{
        symbol: string;
        name?: string;
        dailyUpdates: boolean;
      }>;
    }> = [];

    snapshot.forEach((doc: any) => {
      const userData = doc.data();
      if (userData.favoriteTickers && userData.favoriteTickers.length > 0) {
        // Filter for tickers with daily updates enabled
        const dailyUpdateTickers = userData.favoriteTickers.filter(
          (ticker: any) => ticker.dailyUpdates === true
        );

        if (dailyUpdateTickers.length > 0) {
          usersWithTickers.push({
            email: userData.email,
            favoriteTickers: dailyUpdateTickers,
          });
        }
      }
    });

    return NextResponse.json({
      users: usersWithTickers,
      count: usersWithTickers.length,
    });
  } catch (error) {
    console.error('Error fetching users with favorite tickers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // For getting users by specific ticker symbol
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ticker } = body;

    if (!ticker) {
      return NextResponse.json({ error: 'Ticker symbol is required' }, { status: 400 });
    }

    // Get all users who have this specific ticker with daily updates enabled
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.get();
    
    const usersWithTicker: string[] = [];

    snapshot.forEach((doc: any) => {
      const userData = doc.data();
      if (userData.favoriteTickers && userData.favoriteTickers.length > 0) {
        const hasTicker = userData.favoriteTickers.some(
          (t: any) => t.symbol === ticker.toUpperCase() && t.dailyUpdates === true
        );

        if (hasTicker) {
          usersWithTicker.push(userData.email);
        }
      }
    });

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      emails: usersWithTicker,
      count: usersWithTicker.length,
    });
  } catch (error) {
    console.error('Error fetching users for ticker:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
