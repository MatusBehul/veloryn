'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Check, X } from 'lucide-react';

export default function PricingPage() {
  const { user } = useAuth();
  const { createCheckoutSession, hasActiveSubscription, subscriptionTier, loading } = useSubscription();
  const { t } = useTranslation();
  
  // Terms of Service modal state
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pendingPriceId, setPendingPriceId] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    // Show terms modal instead of proceeding directly
    setPendingPriceId(priceId);
    setShowTermsModal(true);
  };

  const handleTermsAccept = async () => {
    if (!termsAccepted || !pendingPriceId) {
      return;
    }

    try {
      await createCheckoutSession(pendingPriceId);
    } catch (error) {
      console.error('Error subscribing:', error);
    } finally {
      setShowTermsModal(false);
      setPendingPriceId(null);
      setTermsAccepted(false);
    }
  };

  const handleTermsCancel = () => {
    setShowTermsModal(false);
    setPendingPriceId(null);
    setTermsAccepted(false);
  };

    const features = [
    { name: t('ai_financial_analysis'), free: false, standard: true, premium: true },
    { name: t('email_reports'), free: false, standard: true, premium: true },
    { name: t('historical_data_access'), free: false, standard: true, premium: true },
  ];

  // Terms of Service Modal Component
  const TermsModal = () => {
    if (!showTermsModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('checkoutPopupTitle')}
            </h2>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-amber-800 font-medium mb-4">
                {t('checkoutPopupText1')}:
              </p>
              
              <div className="space-y-3 text-sm text-amber-700">
                <div className="flex items-start">
                  <span className="font-semibold mr-2">1.</span>
                  <span>{t('checkoutPopupText2')}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold mr-2">2.</span>
                  <span>{t('checkoutPopupText3')}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold mr-2">3.</span>
                  <span>{t('checkoutPopupText4')}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold mr-2">4.</span>
                  <span>{t('checkoutPopupText5')}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold mr-2">5.</span>
                  <span>{t('checkoutPopupText6')}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold mr-2">6.</span>
                  <span>{t('checkoutPopupText7')} <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> & <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold mr-2">7.</span>
                  <span>{t('immediate_access_to_the_service')}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold mr-2">8.</span>
                  <span>{t('checkoutPopupText7a')}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-900">
                  {t('checkoutPopupText8')}
                </span>
              </label>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleTermsCancel}
                variant="outline"
                className="flex-1"
              >
                {t('checkoutPopupText9')}
              </Button>
              <Button
                onClick={handleTermsAccept}
                disabled={!termsAccepted || loading}
                loading={loading}
                className="flex-1"
              >
                {t('checkoutPopupText10')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('simple_transparent_pricing')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('access_institutional_analysis')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Standard Plan */}
          <Card className="border-2 border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                {t('most_popular')}
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">{t('standard_tier')}</CardTitle>
              <div className="text-4xl font-bold text-gray-900">
                €2
                <span className="text-lg font-normal text-gray-500">/{t('month')}</span>
              </div>
              <p className="text-gray-600">
                {t('full_ai_analysis_basic_email')}
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
                  <span>{t('up_to_5_daily_emails')}</span>
                </li>
              </ul>
              
              {hasActiveSubscription && subscriptionTier === 'standard' ? (
                <Button className="w-full" disabled>
                  {t('current_plan')}
                </Button>
              ) : hasActiveSubscription ? (
                <div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleSubscribe('price_standard')}
                    disabled={loading}
                  >
                    {subscriptionTier === 'premium' ? t('downgrade_to_standard') : t('subscribe_now')}
                  </Button>
                  <p className="text-xs text-gray-500 pt-2">
                    {t('immediate_access_to_the_service')}
                  </p>
                </div>
              ) : (
                <div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleSubscribe('price_standard')}
                    loading={loading}
                  >
                    {t('subscribe_now')}
                  </Button>
                  <p className="text-xs text-gray-500 pt-2">
                    {t('immediate_access_to_the_service')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-purple-500 relative">
            <CardHeader>
              <CardTitle className="text-2xl">{t('premium_tier')}</CardTitle>
              <div className="text-4xl font-bold text-gray-900">
                €10
                <span className="text-lg font-normal text-gray-500">/{t('month')}</span>
              </div>
              <p className="text-gray-600">
                {t('enhanced_analysis_priority')}
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
                  <span>{t('up_to_20_daily_emails')}</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>{t('priority_support')}</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>{t('advanced_analytics')}</span>
                </li>
              </ul>
              
              {hasActiveSubscription && subscriptionTier === 'premium' ? (
                <Button className="w-full" disabled>
                  {t('current_plan')}
                </Button>
              ) : hasActiveSubscription ? (
                <div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleSubscribe('price_premium')}
                    loading={loading}
                  >
                    {subscriptionTier === 'standard' ? t('upgrade_to_premium') : t('subscribe_now')}
                  </Button>
                  <p className="text-xs text-gray-500 pt-2">
                    {t('immediate_access_to_the_service')}
                  </p>
                </div>
              ) : (
                <div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleSubscribe('price_premium')}
                    loading={loading}
                  >
                    {t('subscribe_now')}
                  </Button>
                  <p className="text-xs text-gray-500 pt-2">
                    {t('immediate_access_to_the_service')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-gray-900 font-bold mb-4">
              {t('frequently_asked_questions')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray">
            <div>
              <h3 className="text-lg text-gray-900 font-semibold mb-2">{t('is_this_financial_advice')}</h3>
              <p className="text-gray-600">
                {t('is_this_financial_advice_answer')}
              </p>
            </div>
            <div>
              <h3 className="text-lg text-gray-900 font-semibold mb-2">{t('can_i_cancel_anytime')}</h3>
              <p className="text-gray-600">
                {t('can_i_cancel_anytime_answer')}
              </p>
            </div>
            <div>
              <h3 className="text-lg text-gray-900 font-semibold mb-2">{t('what_payment_methods')}</h3>
              <p className="text-gray-600">
                {t('what_payment_methods_answer')}
              </p>
            </div>
            <div>
              <h3 className="text-lg text-gray-900 font-semibold mb-2">{t('do_you_offer_refunds')}</h3>
              <p className="text-gray-600">
                {t('do_you_offer_refunds_answer')}
              </p>
            </div>
            <div>
              <h3 className="text-lg text-gray-900 font-semibold mb-2">{t('why_these_prices')}</h3>
              <p className="text-gray-600">
                {t('why_these_prices_answer')}
              </p>
            </div>
            <div>
              <h3 className="text-lg text-gray-900 font-semibold mb-2">{t('is_my_data_secure')}</h3>
              <p className="text-gray-600">
                {t('is_my_data_secure_answer')}
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-16">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">{t('shared_red_page_disclaimer_title')}</h3>
            <p className="text-sm text-red-700">
              {t('shared_red_page_disclaimer_text')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Terms of Service Modal */}
      <TermsModal />
    </div>
  );
}
