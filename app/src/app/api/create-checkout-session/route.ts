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

    // Fetch price mappings from Firestore
    let priceMapping: { [key: string]: string } = {};
    try {
      const configDoc = await adminDb.collection('conf').doc('subscriptions').get();
      if (configDoc.exists) {
        const configData = configDoc.data();
        console.log('Fetched price config from Firestore:', configData);
        
        // Build price mapping from Firestore data
        if (configData) {
          for (const [priceId, tier] of Object.entries(configData)) {
            if (typeof tier === 'string' && priceId.startsWith('price_1')) {
              priceMapping[`price_${tier}`] = priceId;
            }
          }
        }
      } else {
        console.warn('Subscriptions config document not found in Firestore');
      }
    } catch (firestoreError) {
      console.error('Error fetching price config from Firestore:', firestoreError);
    }
    
    console.log('Final price mapping:', priceMapping);

    // Use provided priceId with mapping, or fall back to standard price
    let selectedPriceId: string;
    if (priceId && priceMapping[priceId]) {
      selectedPriceId = priceMapping[priceId];
    } else if (priceId && priceId.startsWith('price_1')) {
      // If it's already a real Stripe price ID, use it directly
      selectedPriceId = priceId;
    } else {
      // Default to standard price
      selectedPriceId = priceMapping['price_standard'];
    }

    console.log('Price mapping:', { originalPriceId: priceId, selectedPriceId, PRICE_ID });

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

    // Get the base URL for redirect URLs with robust fallback
    let baseUrl = process.env.NEXTAUTH_URL;
    
    if (!baseUrl) {
      // Fallback to request origin or hardcoded URL
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');
      
      if (origin) {
        baseUrl = origin;
      } else if (host) {
        baseUrl = `https://${host}`;
      } else {
        baseUrl = 'https://test.veloryn.wadby.cloud';
      }
    }
    
    console.log('Creating checkout session with base URL:', baseUrl);
    console.log('Environment NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    console.log('Request origin:', request.headers.get('origin'));
    console.log('Request host:', request.headers.get('host'));
    
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
