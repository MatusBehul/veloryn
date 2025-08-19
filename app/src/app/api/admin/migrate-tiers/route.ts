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

    console.log('🔄 Starting tier migration for all users...');

    // Get the tier mapping configuration
    const velorynSubscriptionsConfig = await adminDb.collection('config').doc('subscriptions').get();
    const tierMapping = velorynSubscriptionsConfig.data();

    if (!tierMapping) {
      return NextResponse.json({ error: 'Subscription tier mapping not found in config' }, { status: 500 });
    }

    console.log('📋 Tier mapping:', tierMapping);

    // Get all users with customer IDs
    const usersSnapshot = await adminDb.collection('users').where('customerId', '!=', null).get();
    console.log(`👥 Found ${usersSnapshot.size} users with customer IDs`);

    const results = {
      processed: 0,
      updated: 0,
      errors: 0,
      details: [] as any[]
    };

    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      try {
        results.processed++;
        console.log(`🔄 Processing user ${userId} (${userData.email || 'no email'})`);

        // Get all subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: userData.customerId,
          limit: 10,
        });

        let updateData: any = {
          updatedAt: new Date(),
        };

        if (subscriptions.data.length === 0) {
          // No subscriptions found, set to free tier
          updateData = {
            ...updateData,
            subscriptionStatus: 'inactive',
            subscriptionTier: 'free',
            subscriptionId: null,
            currentPeriodEnd: null,
          };
          
          console.log(`  ➡️  No subscriptions, setting to free tier`);
        } else {
          // Find the most recent active subscription
          const activeSubscriptions = subscriptions.data.filter(sub => 
            sub.status === 'active' || sub.status === 'trialing'
          );
          
          const latestSubscription = activeSubscriptions.length > 0 
            ? activeSubscriptions[0] 
            : subscriptions.data[0];

          const priceId = latestSubscription.items.data[0].price.id;
          const tier = tierMapping[priceId] || 'free';
          
          const subscriptionWithPeriod = latestSubscription as { current_period_end?: number };
          const currentPeriodEnd = subscriptionWithPeriod.current_period_end 
            ? new Date(subscriptionWithPeriod.current_period_end * 1000) 
            : null;

          updateData = {
            ...updateData,
            subscriptionId: latestSubscription.id,
            subscriptionStatus: latestSubscription.status,
            subscriptionTier: tier,
            currentPeriodEnd: currentPeriodEnd,
          };

          console.log(`  ➡️  Found subscription ${latestSubscription.id}, status: ${latestSubscription.status}, tier: ${tier}`);
        }

        // Update the user document
        await adminDb.collection('users').doc(userId).set(updateData, { merge: true });
        
        results.updated++;
        results.details.push({
          userId,
          email: userData.email,
          tier: updateData.subscriptionTier,
          status: updateData.subscriptionStatus,
          success: true
        });

      } catch (error) {
        results.errors++;
        console.error(`❌ Error processing user ${userId}:`, error);
        
        results.details.push({
          userId,
          email: userData.email,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
      }
    }

    console.log('✅ Migration completed:', results);

    return NextResponse.json({
      message: 'Tier migration completed',
      results
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
