import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('Test API called:', request.url);
  
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');
  
  return NextResponse.json({ 
    message: 'Test API working',
    url: request.url,
    ticker: ticker,
    params: Object.fromEntries(searchParams.entries())
  });
}
