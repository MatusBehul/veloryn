import { NextRequest, NextResponse } from 'next/server';

// Simple test endpoint to verify webhook connectivity
export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  return NextResponse.json({ 
    message: 'Webhook endpoint received POST request',
    timestamp: new Date().toISOString()
  });
}
