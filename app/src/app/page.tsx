'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { MarketingContent } from '@/components/MarketingContent';
import { ClientOnly } from '@/components/ClientOnly';
import { 
  TrendingUp, 
  BarChart3, 
  Brain, 
  Shield, 
  Zap, 
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const { hasActiveSubscription, createCheckoutSession } = useSubscription();
  const { t } = useTranslation();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
              <span className="block sm:inline">Veloryn - </span>
              <span className="text-blue-500 block sm:inline">{t('heroTitle')}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 leading-relaxed">
              {t('heroSubtitle')}
            </p>            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              {user ? (
                <Link href="/analysis" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3">
                    {t('viewAnalysis')}
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3">
                      {t('starting_at_price')}
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3">
                      {t('login')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
              {t('poweredByAI')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto px-4">
              {t('multiAgentDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                </div>
                <CardTitle className="text-lg sm:text-xl">{t('secFillingAnalysisTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-sm sm:text-base text-slate-600">
                  {t('secFillingAnalysisDescription')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">{t('marketDataAnalysisTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-sm sm:text-base text-gray-600">
                  {t('marketDataAnalysisDescription')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg sm:col-span-2 lg:col-span-1">
              <CardHeader className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">{t('sentimentAnalysisTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-sm sm:text-base text-gray-600">
                  {t('sentimentAnalysisDescription')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">{t('riskManagementTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-sm sm:text-base text-gray-600">
                  {t('riskManagementDescription')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">{t('tradingStrategiesTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-sm sm:text-base text-gray-600">
                  {t('tradingStrategiesDescription')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg sm:col-span-2 lg:col-span-1">
              <CardHeader className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">{t('multiAgentCollaborationTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-sm sm:text-base text-gray-600">
                  {t('multiAgentCollaborationDescription')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Marketing Content - Dynamic content from integration */}
      <MarketingContent showLoading={true} />

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                {t('featuresTitle')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                {t('institutionalQuality')}
              </p>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{t('tradingStrategiesTitle')}</h3>
                    <p className="text-gray-600 text-sm sm:text-base">{t('tradingStrategiesDescription')}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{t('multiAgentCollaborationTitle')}</h3>
                    <p className="text-gray-600 text-sm sm:text-base">{t('multiAgentCollaborationDescription')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8">
                <div className="text-center">
                  {user ? (
                    hasActiveSubscription ? (
                      // Active subscriber
                      <>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                          {t('memberWelcomeTitle')}
                        </h3>
                        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                          {t('memberWelcomeDescription')}
                        </p>
                        <Link href="/analysis" className="block">
                          <Button size="lg" className="w-full text-sm sm:text-base">
                            {t('viewAnalysis')}
                          </Button>
                        </Link>
                      </>
                    ) : (
                      // Signed in but no subscription
                      <>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                          {t('upgradeTitle')}
                        </h3>
                        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                          {t('upgradeDescription')}
                        </p>
                        <Button 
                          size="lg" 
                          className="w-full text-sm sm:text-base"
                          onClick={() => createCheckoutSession()}
                        >
                          {t('upgradeNow')}
                        </Button>
                      </>
                    )
                  ) : (
                    // Not signed in
                    <>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                        {t('joinTitle')}
                      </h3>
                      <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                        {t('joinDescription')}
                      </p>
                      <Link href="/login" className="block">
                        <Button size="lg" className="w-full text-sm sm:text-base">
                          {t('signUpNow')}
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2">{t('disclaimerTitle')}</h3>
            <p className="text-xs sm:text-sm text-red-700 leading-relaxed">
              {t('disclaimerText')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
