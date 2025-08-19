'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Check, X } from 'lucide-react';

export default function PricingPage() {
  const { user } = useAuth();
  const { createCheckoutSession, hasActiveSubscription, subscriptionTier, loading } = useSubscription();

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    try {
      await createCheckoutSession(priceId);
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

    const features = [
    { name: "AI Financial Analysis", free: false, standard: true, premium: true },
    { name: "Email Reports", free: false, standard: true, premium: true },
    { name: "Historical Data Access", free: false, standard: true, premium: true },
  ];

  return (
    <div className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Access institutional-quality financial analysis starting at just €2/month. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Standard Plan */}
          <Card className="border-2 border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Standard</CardTitle>
              <div className="text-4xl font-bold text-gray-900">
                €2
                <span className="text-lg font-normal text-gray-500">/month</span>
              </div>
              <p className="text-gray-600">
                Full AI analysis with basic email capacity
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    {feature.standard ? (
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mr-3" />
                    )}
                    <span>{feature.name}</span>
                  </li>
                ))}
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Up to 5 daily emails</span>
                </li>
              </ul>
              
              {hasActiveSubscription && subscriptionTier === 'standard' ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : hasActiveSubscription ? (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleSubscribe('price_standard')}
                  disabled={loading}
                >
                  {subscriptionTier === 'premium' ? 'Downgrade to Standard' : 'Subscribe Now'}
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe('price_standard')}
                  loading={loading}
                >
                  Subscribe Now
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-purple-500 relative">
            <CardHeader>
              <CardTitle className="text-2xl">Premium</CardTitle>
              <div className="text-4xl font-bold text-gray-900">
                €10
                <span className="text-lg font-normal text-gray-500">/month</span>
              </div>
              <p className="text-gray-600">
                Enhanced analysis with priority support
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    {feature.premium ? (
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mr-3" />
                    )}
                    <span>{feature.name}</span>
                  </li>
                ))}
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Up to 20 daily emails</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
              
              {hasActiveSubscription && subscriptionTier === 'premium' ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : hasActiveSubscription ? (
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe('price_premium')}
                  loading={loading}
                >
                  {subscriptionTier === 'standard' ? 'Upgrade to Premium' : 'Subscribe Now'}
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe('price_premium')}
                  loading={loading}
                >
                  Subscribe Now
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-gray-900 font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray">
            <div>
              <h3 className="text-lg text-gray-900 font-semibold mb-2">Is this financial advice?</h3>
              <p className="text-gray-600">
                No. This system provides AI-generated analysis for educational and informational 
                purposes only. Always consult qualified financial advisors before making investment decisions.
              </p>
            </div>
            <div>
              <h3 className="text-lg text-gray-900 font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time through your subscription management page 
                or the Stripe billing portal.
              </p>
            </div>
            <div>
              <h3 className="text-lg text-gray-900 font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards and debit cards through Stripe&apos;s secure payment processing.
              </p>
            </div>
            <div>
              <h3 className="text-lg text-gray-900 font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">
                While we don&apos;t offer refunds for partial months, you retain access until your subscription period ends. 
                You can cancel anytime to prevent future charges.
              </p>
            </div>
            <div>
              <h3 className="text-lg text-gray-900 font-semibold mb-2">Why these prices?</h3>
              <p className="text-gray-600">
                We believe powerful financial analysis should be accessible to everyone, not just institutional investors. 
                Our affordable pricing makes professional-grade tools available to individual investors. Everybody should have access to the same tools as the big players so the game of trading and investment is a bit more fair.
              </p>
            </div>
            <div>
              <h3 className="text-lg text-gray-900 font-semibold mb-2">Is my data secure?</h3>
              <p className="text-gray-600">
                Yes, we use industry-standard security measures including Firebase authentication 
                and encrypted data storage. We are not storing your financial data, nor your payment details nor your personal information (except your email to be able identify you).
                For all data manipulation and access, we use secure APIs and follow best practices to ensure your data is protected. Our partnersfor these points are Google Cloud Firebase (authentication) and Stripe (payment processing).
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-16">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ Important Disclaimer</h3>
            <p className="text-sm text-red-700">
              This system provides AI-generated analysis for educational and informational purposes only. 
              All output is NOT financial advice, NOT offers to buy or sell securities, and NOT guaranteed 
              for accuracy, completeness, or profitability. Users must conduct independent research and 
              consult qualified financial advisors before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
