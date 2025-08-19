'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { hasActiveSubscription, createPortalSession, createCheckoutSession, syncSubscription, loading } = useSubscription();
  const [canceling, setCanceling] = useState(false);
  const [syncing, setSyncing] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Please Sign In</h2>
              <p className="text-gray-600 mb-4">You need to be signed in to manage your subscription.</p>
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    setCanceling(true);
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          customerId: user.customerId,
        }),
      });

      if (response.ok) {
        alert('Subscription cancelled successfully. You will retain access until the end of your billing period.');
        window.location.reload();
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Unable to cancel subscription. Please contact support.');
    } finally {
      setCanceling(false);
    }
  };

  const handleManagePayment = async () => {
    try {
      await createPortalSession();
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Unable to open billing portal. Please contact support at support@yourcompany.com');
    }
  };

  const handleSyncSubscription = async () => {
    setSyncing(true);
    try {
      await syncSubscription();
      alert('Subscription data synced successfully!');
    } catch (error) {
      console.error('Error syncing subscription:', error);
      alert('Failed to sync subscription data. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-2">Manage your Veloryn membership and billing information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {hasActiveSubscription ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                )}
                Subscription Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-lg font-semibold">
                    {hasActiveSubscription ? (
                      <span className="text-green-600">Active Member</span>
                    ) : (
                      <span className="text-yellow-600">Inactive</span>
                    )}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Plan</label>
                  <p className="text-lg">
                    {hasActiveSubscription ? 'Veloryn Premium - €5/month' : 'No active subscription'}
                  </p>
                </div>

                {user.currentPeriodEnd && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      {user.subscriptionStatus === 'canceled' ? 'Access ends' : 'Next billing date'}
                    </label>
                    <p className="text-lg">
                      {new Date(user.currentPeriodEnd * 1000).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Manage Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hasActiveSubscription ? (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-800 mb-2">Active Membership</h3>
                      <p className="text-sm text-green-700">
                        You have full access to all Veloryn premium features including unlimited financial analysis.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={handleManagePayment}
                        disabled={loading}
                        className="w-full"
                        variant="outline"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {loading ? 'Loading...' : 'Update Payment Method'}
                      </Button>

                      <Button
                        onClick={handleSyncSubscription}
                        disabled={syncing}
                        className="w-full"
                        variant="outline"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {syncing ? 'Syncing...' : 'Sync Subscription Status'}
                      </Button>

                      <Button
                        onClick={handleCancelSubscription}
                        disabled={canceling}
                        className="w-full"
                        variant="outline"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        {canceling ? 'Canceling...' : 'Cancel Subscription'}
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500">
                      * Cancellation takes effect at the end of your current billing period
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-800 mb-2">Upgrade to Premium</h3>
                      <p className="text-sm text-blue-700 mb-3">
                        Get unlimited access to AI-powered financial analysis for just €5/month.
                      </p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Unlimited financial analysis</li>
                        <li>• Real-time market insights</li>
                        <li>• Risk assessment tools</li>
                        <li>• Technical analysis</li>
                      </ul>
                    </div>

                    <Button
                      onClick={createCheckoutSession}
                      disabled={loading}
                      className="w-full"
                      variant="primary"
                    >
                      {loading ? 'Loading...' : 'Upgrade Now - €5/month'}
                    </Button>

                    <Button
                      onClick={handleSyncSubscription}
                      disabled={syncing}
                      className="w-full"
                      variant="outline"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {syncing ? 'Syncing...' : 'Already subscribed? Sync Status'}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Contact */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                If you have any questions about your subscription or need assistance, please contact our support team.
              </p>
              <Link href="/contact">
                <Button variant="outline">Contact Support</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
