'use client';

import React from 'react';
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
    { name: t('ai_financial_analysis'), free: false, standard: true, premium: true },
    { name: t('email_reports'), free: false, standard: true, premium: true },
    { name: t('historical_data_access'), free: false, standard: true, premium: true },
  ];

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
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleSubscribe('price_standard')}
                  disabled={loading}
                >
                  {subscriptionTier === 'premium' ? t('downgrade_to_standard') : t('subscribe_now')}
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe('price_standard')}
                  loading={loading}
                >
                  {t('subscribe_now')}
                </Button>
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
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe('price_premium')}
                  loading={loading}
                >
                  {subscriptionTier === 'standard' ? t('upgrade_to_premium') : t('subscribe_now')}
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe('price_premium')}
                  loading={loading}
                >
                  {t('subscribe_now')}
                </Button>
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
    </div>
  );
}
