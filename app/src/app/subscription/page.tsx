'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { hasActiveSubscription, createPortalSession, createCheckoutSession, syncSubscription, loading } = useSubscription();
  const [canceling, setCanceling] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Helper function to get plan display name
  const getPlanDisplayName = (tier: string) => {
    switch (tier) {
      case 'standard':
        return t('subscriptionVelorynStandard');
      case 'premium':
        return t('subscriptionVelorynPremium');
      case 'ultimate':
        return t('subscriptionVelorynUltimate');
      case 'vip':
        return t('subscriptionVelorynUltimate'); // VIP maps to Ultimate for display
      case 'free':
      default:
        return t('subscriptionNoActive');
    }
  };

  // Helper function to get plan pricing
  const getPlanPricing = (tier: string) => {
    switch (tier) {
      case 'standard':
        return { price: '2', period: t('month') };
      case 'premium':
        return { price: '10', period: t('month') };
      case 'ultimate':
      case 'vip':
        return { price: '25', period: t('month') }; // Assuming ultimate is higher tier
      case 'free':
      default:
        return null;
    }
  };

  // Get formatted plan display
  const getFormattedPlan = () => {
    if (!user || !hasActiveSubscription) {
      return t('subscriptionNoActive');
    }
    
    const planName = getPlanDisplayName(user.subscriptionTier);
    const pricing = getPlanPricing(user.subscriptionTier);
    
    if (pricing) {
      return t('subscriptionPlanWithPrice')
        .replace('{planName}', planName)
        .replace('{price}', pricing.price)
        .replace('{period}', pricing.period);
    }
    
    return planName;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">{t('subscriptionPleaseSignIn')}</h2>
              <p className="text-gray-600 mb-4">{t('subscriptionSignInDescription')}</p>
              <Link href="/login">
                <Button>{t('subscriptionSignIn')}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCancelSubscription = async () => {
    if (!confirm(t('subscriptionCancelConfirmation'))) {
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
        alert(t('subscriptionCanceledSuccess'));
        window.location.reload();
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert(t('subscriptionCancelError'));
    } finally {
      setCanceling(false);
    }
  };

  const handleManagePayment = async () => {
    try {
      await createPortalSession();
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert(t('subscriptionPortalError'));
    }
  };

  const handleSyncSubscription = async () => {
    setSyncing(true);
    try {
      await syncSubscription();
      alert(t('subscriptionSyncSuccess'));
    } catch (error) {
      console.error('Error syncing subscription:', error);
      alert(t('subscriptionSyncError'));
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
            {t('subscriptionBackToHome')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t('subscriptionManagement')}</h1>
          <p className="text-gray-600 mt-2">{t('subscriptionManageDescription')}</p>
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
                {t('subscriptionStatus')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">{t('subscriptionStatusLabel')}</label>
                  <p className="text-lg font-semibold">
                    {hasActiveSubscription ? (
                      <span className="text-green-600">{t('subscriptionActiveMember')}</span>
                    ) : (
                      <span className="text-yellow-600">{t('subscriptionInactive')}</span>
                    )}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">{t('subscriptionPlan')}</label>
                  <p className="text-lg">
                    {getFormattedPlan()}
                  </p>
                </div>

                {user.currentPeriodEnd && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      {user.subscriptionStatus === 'canceled' ? t('subscriptionAccessEnds') : t('subscriptionNextBilling')}
                    </label>
                    <p className="text-lg">
                      {new Date(user.currentPeriodEnd * 1000).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">{t('subscriptionEmailLabel')}</label>
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
                {t('subscriptionManageTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hasActiveSubscription ? (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-800 mb-2">{t('subscriptionActiveMembership')}</h3>
                      <p className="text-sm text-green-700">
                        {t('subscriptionFullAccess')}
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
                        {loading ? t('loading') : t('subscriptionUpdatePayment')}
                      </Button>

                      <Button
                        onClick={handleSyncSubscription}
                        disabled={syncing}
                        className="w-full"
                        variant="outline"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {syncing ? t('subscriptionSyncing') : t('subscriptionSyncStatus')}
                      </Button>

                      <Button
                        onClick={handleCancelSubscription}
                        disabled={canceling}
                        className="w-full"
                        variant="outline"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        {canceling ? t('subscriptionCanceling') : t('subscriptionCancel')}
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500">
                      {t('subscriptionCancelNote')}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-800 mb-2">{t('subscriptionUpgradeToPremium')}</h3>
                      <p className="text-sm text-blue-700 mb-3">
                        {t('subscriptionUpgradeDescription')}
                      </p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>{t('subscriptionUnlimitedAnalysis')}</li>
                        <li>{t('subscriptionRealTimeInsights')}</li>
                        <li>{t('subscriptionRiskAssessment')}</li>
                        <li>{t('subscriptionTechnicalAnalysis')}</li>
                      </ul>
                    </div>

                    <Button
                      onClick={() => createCheckoutSession()}
                      disabled={loading}
                      className="w-full"
                      variant="primary"
                    >
                      {loading ? t('loading') : t('subscriptionUpgradeNow')}
                    </Button>

                    <Button
                      onClick={handleSyncSubscription}
                      disabled={syncing}
                      className="w-full"
                      variant="outline"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {syncing ? t('subscriptionSyncing') : t('subscriptionAlreadySubscribed')}
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
              <h3 className="font-semibold text-gray-900 mb-2">{t('subscriptionNeedHelp')}</h3>
              <p className="text-gray-600 mb-4">
                {t('subscriptionSupportDescription')}
              </p>
              <Link href="/contact">
                <Button variant="outline">{t('subscriptionContactSupport')}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
