import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { adminDb } from '@/lib/firebase-admin';
import Stripe from 'stripe';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Integration platform configuration
const INTEGRATION_ENABLED = process.env.ENABLE_INTEGRATION === 'true';
const INTEGRATION_BASE_URL = process.env.INTEGRATION_BASE_URL || 'https://can686f6c6f1c22e3c16e9c2ae9.wadby.cloud';
const TENANT_ID = process.env.INTEGRATION_TENANT_ID || '6857adca5512b6bcae0ff18e';
const INTEGRATION_HEADERS = {
  'instance': process.env.INTEGRATION_INSTANCE || '',
  'AuthEntityType': 'service',
  'AuthKey': process.env.INTEGRATION_AUTH_KEY || '',
  'Authorization': process.env.INTEGRATION_AUTHORIZATION_TOKEN || '',
  'Content-Type': 'application/json'
};

export async function POST(request: NextRequest) {
  console.log('🔔 Stripe webhook received');
  
  try {
    // Check if Firebase Admin and Stripe are available
    if (!adminDb) {
      console.error('❌ Firebase Admin not available');
      return NextResponse.json({ error: 'Firebase Admin not available' }, { status: 500 });
    }

    if (!stripe) {
      console.error('❌ Stripe not available');
      return NextResponse.json({ error: 'Stripe not available' }, { status: 500 });
    }

    if (!webhookSecret) {
      console.error('❌ Webhook secret not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const body = await request.text();
    console.log('📨 Request body length:', body.length);
    
    const signature = request.headers.get('stripe-signature');
    console.log('🔐 Stripe signature present:', !!signature);

    if (!signature) {
      console.error('❌ Missing stripe signature');
      return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe!.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('✅ Event verified successfully. Type:', event.type, 'ID:', event.id);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('🎯 Processing event:', event.type);

    switch (event.type) {
      case 'customer.subscription.created':
        console.log('🆕 New subscription created');
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.updated':
        console.log('🔄 Subscription updated');
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        console.log('🗑️ Subscription deleted');
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        console.log('💰 Payment succeeded');
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        console.log('❌ Payment failed');
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log(`❓ Unhandled event type: ${event.type}`);
    }

    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Tier-based limits for favorite tickers (must match the ones in tickers API)
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

async function performTierHousekeeping(userId: string, oldTier: string, newTier: string, currentTickers: any[]): Promise<any[]> {
  const oldLimit = getTierLimit(oldTier);
  const newLimit = getTierLimit(newTier);
  
  console.log(`🧹 Housekeeping for user ${userId}: ${oldTier}(${oldLimit}) -> ${newTier}(${newLimit}), current tickers: ${currentTickers.length}`);
  
  // If new tier has higher or equal limit, no action needed
  if (newLimit >= currentTickers.length) {
    console.log(`✅ No housekeeping needed - new limit (${newLimit}) is sufficient for current tickers (${currentTickers.length})`);
    return currentTickers;
  }
  
  // If downgrading and user has more tickers than new tier allows, trim them
  if (currentTickers.length > newLimit) {
    const originalCount = currentTickers.length;
    
    // Keep the most recently added tickers (assuming they're more important)
    // For better UX, we could prioritize tickers with dailyUpdates enabled
    const prioritizedTickers = currentTickers
      .sort((a, b) => {
        // First priority: tickers with daily updates enabled
        if (a.dailyUpdates && !b.dailyUpdates) return -1;
        if (!a.dailyUpdates && b.dailyUpdates) return 1;
        // Secondary priority: maintain original order (most recent)
        return 0;
      })
      .slice(0, newLimit);

    console.log(`🔄 Trimming favorite tickers for user ${userId}: ${originalCount} -> ${newLimit} (removed ${originalCount - newLimit} tickers)`);
    
    // Log which tickers were removed for debugging
    const removedTickers = currentTickers.filter(ticker => 
      !prioritizedTickers.some(kept => kept.symbol === ticker.symbol)
    );
    console.log(`📋 Removed tickers: ${removedTickers.map(t => t.symbol).join(', ')}`);
    
    return prioritizedTickers;
  }
  
  return currentTickers;
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log('🔄 Processing subscription change:', subscription.id);
  console.log('📊 Subscription details:', {
    id: subscription.id,
    status: subscription.status,
    priceId: subscription.items.data[0]?.price?.id,
    metadata: subscription.metadata
  });
  
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('❌ No userId found in subscription metadata:', subscription.metadata);
    return;
  }

  const status = subscription.status;
  const subscriptionWithPeriod = subscription as { current_period_end?: number };
  const currentPeriodEnd = subscriptionWithPeriod.current_period_end ? new Date(subscriptionWithPeriod.current_period_end * 1000) : null;

  console.log(`🔄 Updating subscription for user ${userId}: status=${status}, periodEnd=${currentPeriodEnd}`);

  const velorynSubscriptionsConfig = await adminDb.collection('conf').doc('subscriptions').get();
  const newTier = velorynSubscriptionsConfig.data()?.[subscription.items.data[0].price.id] || 'free';

  console.log('📋 Subscription config data:', velorynSubscriptionsConfig.data());
  console.log('🎯 Price ID from subscription:', subscription.items.data[0].price.id);
  console.log('🏷️ Mapped tier:', newTier);

  try {
    // Get current user data to check for tier changes
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const currentUserData = userDoc.exists ? userDoc.data() : {};
    const oldTier = currentUserData?.subscriptionTier || 'free';
    const currentTickers = currentUserData?.favoriteTickers || [];

    // Perform housekeeping if tier is changing
    let updatedTickers = currentTickers;
    if (oldTier !== newTier) {
      console.log(`🔄 User ${userId} tier changing from ${oldTier} to ${newTier}`);
      updatedTickers = await performTierHousekeeping(userId, oldTier, newTier, currentTickers);
    }

    // Use set with merge to avoid document not found errors
    await adminDb.collection('users').doc(userId).set({
      subscriptionId: subscription.id,
      subscriptionStatus: status,
      subscriptionTier: newTier,
      currentPeriodEnd: currentPeriodEnd,
      favoriteTickers: updatedTickers,
      updatedAt: new Date(),
    }, { merge: true });

    console.log(`✅ Successfully updated subscription for user ${userId}`);
  } catch (error) {
    console.error(`❌ Failed to update subscription for user ${userId}:`, error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  console.log(`🗑️ Canceling subscription for user ${userId}`);

  try {
    // Get current user data for housekeeping
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const currentUserData = userDoc.exists ? userDoc.data() : {};
    const oldTier = currentUserData?.subscriptionTier || 'free';
    const currentTickers = currentUserData?.favoriteTickers || [];

    // Perform housekeeping when downgrading to free tier
    const updatedTickers = await performTierHousekeeping(userId, oldTier, 'free', currentTickers);

    await adminDb.collection('users').doc(userId).set({
      subscriptionStatus: 'canceled',
      subscriptionTier: 'free',
      favoriteTickers: updatedTickers,
      updatedAt: new Date(),
    }, { merge: true });

    console.log(`✅ Successfully canceled subscription for user ${userId} and performed housekeeping`);
  } catch (error) {
    console.error(`❌ Failed to cancel subscription for user ${userId}:`, error);
    throw error;
  }

  console.log(`Successfully canceled subscription for user ${userId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!stripe) return;
  
  const invoiceWithSub = invoice as unknown as { subscription: string };
  const subscriptionId = invoiceWithSub.subscription;
  if (subscriptionId && typeof subscriptionId === 'string') {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await handleSubscriptionChange(subscription);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!stripe) return;
  
  const invoiceWithSub = invoice as unknown as { subscription: string };
  const subscriptionId = invoiceWithSub.subscription;
  if (subscriptionId && typeof subscriptionId === 'string') {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.userId;

    if (userId) {
      console.log(`Payment failed for user ${userId}, setting status to past_due`);
      
      await adminDb.collection('users').doc(userId).set({
        subscriptionStatus: 'past_due',
        subscriptionTier: 'free',
        updatedAt: new Date(),
      }, { merge: true });

      console.log(`Successfully updated payment status for user ${userId}`);
    }
  }
}

// Function to create subscription profile in integration platform
async function createSubscriptionProfile(subscriptionId: string, userEmail: string) {
  if (!INTEGRATION_ENABLED) {
    console.log('🔇 Integration disabled, skipping subscription profile creation');
    return;
  }

  try {
    console.log(`🔗 Creating subscription profile for subscription ${subscriptionId} and user ${userEmail}`);
    
    const createProfileUrl = `${INTEGRATION_BASE_URL}/${TENANT_ID}/profile/create`;
    const createPayload = [
      {
        profile: {
          audience: 'subscription',
          origin: 'default',
          key_name: 'skey',
          key_value: subscriptionId
        },
        parent: {
          audience: 'customer',
          origin: 'default',
          key_name: 'ckey',
          key_value: userEmail
        }
      }
    ];

    console.log('Creating subscription profile with payload:', createPayload);

    const response = await fetch(createProfileUrl, {
      method: 'POST',
      headers: INTEGRATION_HEADERS,
      body: JSON.stringify(createPayload),
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { rawResponse: responseText };
    }

    console.log('Subscription profile creation response status:', response.status);
    console.log('Subscription profile creation response:', responseData);

    if (response.ok) {
      console.log(`✅ Successfully created subscription profile for subscription ${subscriptionId}`);
      return responseData;
    } else {
      console.error(`❌ Failed to create subscription profile for subscription ${subscriptionId}:`, response.status, responseData);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating subscription profile for subscription ${subscriptionId}:`, error);
    return null;
  }
}
