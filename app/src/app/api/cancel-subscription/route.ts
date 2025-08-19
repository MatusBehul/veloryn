import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
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

    const { userId, customerId } = await request.json();

    if (!userId || !customerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the user's subscription
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const subscriptionId = userData?.subscriptionId;

    if (!subscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Cancel the subscription at period end
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update user document
    await adminDb.collection('users').doc(userId).update({
      subscriptionStatus: 'inactive',
      subscriptionTier: 'free',
      updatedAt: new Date(),
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription will be canceled at the end of the billing period',
      cancelAt: subscription.cancel_at,
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json({ 
        error: 'Invalid subscription. Please contact support.',
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
