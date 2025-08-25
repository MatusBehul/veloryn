import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { NewsItem, NewsApiResponse } from '@/types/news';

// Initialize Firebase Admin if not already done
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    const ticker = searchParams.get('ticker');
    const topic = searchParams.get('topic');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    let newsQuery;
    let collectionPath = 'news';

    console.log("-----")
    console.log("Fetch news with filters:", { ticker, topic, dateFrom, dateTo, limit });
    console.log("-----")

    newsQuery = db.collection('news');
    // Optimize query based on filters - only one array-contains filter allowed
    if (ticker && !topic) {
      // Query by ticker only
      newsQuery = newsQuery.where('tickers', 'array-contains', ticker.toUpperCase());
    } else if (topic && !ticker) {
      // Query by topic only
      newsQuery = newsQuery.where('topics', 'array-contains', topic.toLowerCase());
    } else if (ticker && topic) {
      throw new Error("Both 'ticker' and 'topic' filters cannot be applied simultaneously due to Firestore query limitations.");
    }

    // Apply date filters
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      newsQuery = newsQuery.where('time_published_datetime', '>=', fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      newsQuery = newsQuery.where('time_published_datetime', '<=', toDate);
    }

    // Order by time and limit results
    newsQuery = newsQuery
      .orderBy('time_published_datetime', 'desc')
      .limit(limit);

    const snapshot = await newsQuery.get();
    let newsItems: NewsItem[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NewsItem));

    // Sort by time_published_datetime (newest first)
    newsItems.sort((a, b) => {
      const dateA = new Date(a.time_published_datetime || a.time_published);
      const dateB = new Date(b.time_published_datetime || b.time_published);
      return dateB.getTime() - dateA.getTime();
    });

    // Convert Firestore timestamps to ISO strings for JSON serialization
    const serializedNews: NewsItem[] = newsItems.map(item => ({
      ...item,
      time_published_datetime: item.time_published_datetime?.toDate?.() 
        ? item.time_published_datetime.toDate().toISOString()
        : item.time_published_datetime,
      created_at: item.created_at?.toDate?.()
        ? item.created_at.toDate().toISOString()
        : item.created_at,
      updated_at: item.updated_at?.toDate?.()
        ? item.updated_at.toDate().toISOString()
        : item.updated_at
    }));

    return NextResponse.json<NewsApiResponse>({
      success: true,
      count: serializedNews.length,
      news: serializedNews,
      filters: {
        ticker,
        topic,
        dateFrom,
        dateTo,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch news',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
