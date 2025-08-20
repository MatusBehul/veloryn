import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { adminDb } from '@/lib/firebase-admin';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

// Integration platform configuration
const INTEGRATION_ENABLED = process.env.ENABLE_INTEGRATION === 'true';
const INTEGRATION_BASE_URL = 'https://can686f6c6f1c22e3c16e9c2ae9.wadby.cloud';
const TENANT_ID = '6857adca5512b6bcae0ff18e';
const INTEGRATION_HEADERS = {
  'instance': '686f6c6f1c22e3c16e9c2ae9',
  'AuthEntityType': 'service',
  'AuthKey': '689d91f2195fdb96927e5811',
  'Authorization': 'a19a38c753474cd4831ea492316ec2ce5b839959e80b4d3eb692799a1b732c24274bf4e6c78445e68f6e1b4ccbb301d6dc455129383d4e5cb80f9878e9d4c8b9eb9c000a55c34eb5ac0d20fee01e2c69',
  'Content-Type': 'application/json'
};

export async function POST(request: NextRequest) {
  try {
    // Check if Firebase Admin and Stripe are available
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not available' }, { status: 500 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not available' }, { status: 500 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    console.log(`Syncing subscription data for user: ${userId}`);

    // Get user document to find their customer ID
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.customerId) {
      return NextResponse.json({ error: 'User has no Stripe customer ID' }, { status: 404 });
    }

    console.log(`Found customer ID: ${userData.customerId}`);

    const velorynSubscriptionsConfig = await adminDb.collection('conf').doc('subscriptions').get();

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: userData.customerId,
      limit: 10,
    });

    console.log(`Found ${subscriptions.data.length} subscriptions`);

    if (subscriptions.data.length === 0) {
      // No subscriptions found, set status to inactive
      await adminDb.collection('users').doc(userId).set({
        subscriptionStatus: 'inactive',
        subscriptionTier: 'free',
        subscriptionId: null,
        currentPeriodEnd: null,
        updatedAt: new Date(),
      }, { merge: true });

      return NextResponse.json({ 
        message: 'No active subscriptions found, status set to inactive',
        subscriptionStatus: 'inactive',
        subscriptionTier: 'free',
      });
    }

    // Get the most recent subscription
    const latestSubscription = subscriptions.data[0];
    console.log(`Latest subscription: ${latestSubscription.id}, status: ${latestSubscription.status}`);
    
    console.log('📋 Sync-subscription config data:', velorynSubscriptionsConfig.data());
    console.log('🎯 Price ID from sync subscription:', latestSubscription.items.data[0]?.price?.id);
    
    const syncedTier = velorynSubscriptionsConfig.data()?.[latestSubscription.items.data[0].price.id] || 'free';
    console.log('🏷️ Sync mapped tier:', syncedTier);

    // Update user document with subscription info
    const subscriptionWithPeriod = latestSubscription as { current_period_end?: number };
    const currentPeriodEnd = subscriptionWithPeriod.current_period_end ? new Date(subscriptionWithPeriod.current_period_end * 1000) : null;
    
    console.log(`Subscription details: id=${latestSubscription.id}, status=${latestSubscription.status}, periodEnd=${currentPeriodEnd}`);
    
    await adminDb.collection('users').doc(userId).set({
      subscriptionId: latestSubscription.id,
      subscriptionTier: syncedTier,
      subscriptionStatus: latestSubscription.status,
      currentPeriodEnd: currentPeriodEnd,
      updatedAt: new Date(),
    }, { merge: true });

    console.log(`Successfully updated subscription data for user ${userId}`);

    // Create subscription profile in integration platform if subscription is active
    if (INTEGRATION_ENABLED && userData.email && (latestSubscription.status === 'active' || latestSubscription.status === 'trialing')) {
      console.log(`🔗 Subscription is ${latestSubscription.status}, creating integration platform profile`);
      await createSubscriptionProfile(latestSubscription.id, userData.email);
    } else if (!INTEGRATION_ENABLED) {
      console.log('🔇 Integration disabled, skipping subscription profile creation');
    } else if (!userData.email) {
      console.warn(`⚠️ No email found for user ${userId}, skipping integration platform profile creation`);
    } else {
      console.log(`ℹ️ Subscription status is ${latestSubscription.status}, not creating integration platform profile`);
    }

    return NextResponse.json({
      message: 'Subscription data synced successfully',
      subscriptionId: latestSubscription.id,
      subscriptionTier: syncedTier,
      subscriptionStatus: latestSubscription.status,
      currentPeriodEnd: currentPeriodEnd,
    });

  } catch (error) {
    console.error('Error syncing subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
      // Check if already exists
      const isAlreadyExists = responseData?.length > 0 && 
        responseData[0]?.error === 'Profile already exists';
      
      if (isAlreadyExists) {
        console.log(`ℹ️ Subscription profile already exists for subscription ${subscriptionId}`);
        return responseData;
      } else {
        console.error(`❌ Failed to create subscription profile for subscription ${subscriptionId}:`, response.status, responseData);
        return null;
      }
    }
  } catch (error) {
    console.error(`❌ Error creating subscription profile for subscription ${subscriptionId}:`, error);
    return null;
  }
}
