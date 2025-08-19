import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICE_ID } from '@/lib/stripe-server';
import { adminDb } from '@/lib/firebase-admin';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
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
      success_url: `${process.env.NEXTAUTH_URL}/analysis?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
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
