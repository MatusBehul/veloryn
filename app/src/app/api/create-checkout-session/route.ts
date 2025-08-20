import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICE_ID } from '@/lib/stripe-server';
import { adminDb } from '@/lib/firebase-admin';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Debug environment variables
    console.log('Environment variables check:');
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Request origin:', request.headers.get('origin'));
    console.log('Request host:', request.headers.get('host'));
    
    // Check if Firebase Admin and Stripe are available
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not available' }, { status: 500 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not available' }, { status: 500 });
    }

    const { userId, email, priceId } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use provided priceId or fall back to default PRICE_ID
    const selectedPriceId = priceId || PRICE_ID;

    // Create or retrieve customer
    let customer;
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (userDoc.exists && userDoc.data()?.customerId) {
      // Retrieve existing customer
      customer = await stripe.customers.retrieve(userDoc.data()!.customerId);
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId,
        },
      });

      // Update user document with customer ID
      await adminDb.collection('users').doc(userId).set({
        customerId: customer.id,
        updatedAt: new Date(),
      }, { merge: true });
    }

    // Get the base URL for redirect URLs
    const baseUrl = process.env.NEXTAUTH_URL || request.headers.get('origin') || 'https://test.veloryn.wadby.cloud';
    
    console.log('Creating checkout session with base URL:', baseUrl);
    console.log('Environment NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    
    // Ensure the base URL has the proper scheme
    const normalizedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${normalizedBaseUrl}/analysis?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${normalizedBaseUrl}/pricing`,
      metadata: {
        userId: userId,
      },
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
