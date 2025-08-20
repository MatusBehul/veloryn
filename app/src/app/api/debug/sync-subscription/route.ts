import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { stripe } from '@/lib/stripe-server';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
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

    if (!adminDb || !stripe) {
      return NextResponse.json({ error: 'Services not available' }, { status: 500 });
    }

    console.log(`Checking subscription status for user: ${uid}`);

    // Get user document
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json({ error: 'User document not found' }, { status: 404 });
    }

    console.log('Current user data:', {
      customerId: userData.customerId,
      subscriptionTier: userData.subscriptionTier,
      subscriptionStatus: userData.subscriptionStatus,
      subscriptionId: userData.subscriptionId
    });

    if (!userData.customerId) {
      return NextResponse.json({ 
        message: 'No Stripe customer ID found',
        userData: userData 
      });
    }

    // Get subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: userData.customerId,
      status: 'all',
      limit: 10,
    });

    console.log(`Found ${subscriptions.data.length} subscriptions`);

    // Get subscription config
    const configDoc = await adminDb.collection('conf').doc('subscriptions').get();
    const subscriptionConfig = configDoc.data() || {};

    console.log('Subscription config:', subscriptionConfig);

    const subscriptionDetails = subscriptions.data.map(sub => ({
      id: sub.id,
      status: sub.status,
      priceId: sub.items.data[0]?.price?.id,
      tier: subscriptionConfig[sub.items.data[0]?.price?.id] || 'unknown',
      created: new Date(sub.created * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      metadata: sub.metadata // Add metadata to see if userId is present
    }));

    // Find active subscription
    const activeSubscription = subscriptions.data.find(sub => 
      sub.status === 'active' || sub.status === 'trialing'
    );

    let shouldUpdate = false;
    let newTier = 'free';
    let newStatus = 'inactive';
    let newSubscriptionId = null;

    if (activeSubscription) {
      const priceId = activeSubscription.items.data[0]?.price?.id;
      newTier = subscriptionConfig[priceId] || 'free';
      newStatus = activeSubscription.status;
      newSubscriptionId = activeSubscription.id;
      
      // Check if we need to update
      if (userData.subscriptionTier !== newTier || 
          userData.subscriptionStatus !== newStatus ||
          userData.subscriptionId !== newSubscriptionId) {
        shouldUpdate = true;
      }
    } else {
      // No active subscription, should be free
      if (userData.subscriptionTier !== 'free' || userData.subscriptionStatus !== 'inactive') {
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      console.log(`Updating user tier from ${userData.subscriptionTier} to ${newTier}`);
      
      await adminDb.collection('users').doc(uid).set({
        subscriptionTier: newTier,
        subscriptionStatus: newStatus,
        subscriptionId: newSubscriptionId,
        updatedAt: new Date(),
      }, { merge: true });
      
      // Also update the subscription metadata in Stripe if userId is missing
      if (activeSubscription && !activeSubscription.metadata?.userId) {
        console.log('Adding userId to subscription metadata in Stripe');
        try {
          await stripe.subscriptions.update(activeSubscription.id, {
            metadata: {
              ...activeSubscription.metadata,
              userId: uid
            }
          });
          console.log('Successfully updated subscription metadata');
        } catch (metadataError) {
          console.error('Failed to update subscription metadata:', metadataError);
        }
      }
    }

    return NextResponse.json({
      message: shouldUpdate ? 'Subscription synced successfully' : 'Subscription already up to date',
      before: {
        tier: userData.subscriptionTier,
        status: userData.subscriptionStatus,
        subscriptionId: userData.subscriptionId
      },
      after: {
        tier: newTier,
        status: newStatus,
        subscriptionId: newSubscriptionId
      },
      subscriptions: subscriptionDetails,
      updated: shouldUpdate
    });

  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
