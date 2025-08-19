import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is available
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not available' }, { status: 500 });
    }

    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json({ error: 'Missing customer ID' }, { status: 400 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXTAUTH_URL}/analysis`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    
    // Handle specific Stripe configuration error
    if (error.type === 'StripeInvalidRequestError' && error.message?.includes('No configuration provided')) {
      return NextResponse.json({ 
        error: 'Billing portal not configured. Please contact support.',
        details: 'The billing portal needs to be configured in Stripe dashboard.'
      }, { status: 503 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
