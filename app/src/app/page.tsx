'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { MarketingContent } from '@/components/MarketingContent';
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
      <section className="bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              Veloryn - <span className="text-blue-500">{t('heroTitle')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
              {t('heroSubtitle')}
            </p>            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/analysis">
                  <Button size="lg" className="text-lg px-8 py-3">
                    {t('viewAnalysis')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button size="lg" className="text-lg px-8 py-3">
                      {t('get_started')} - €5/month
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-3">
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
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t('poweredByAI')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('multiAgentDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>{t('secFillingAnalysisTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {t('secFillingAnalysisDescription')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>{t('marketDataAnalysisTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('marketDataAnalysisDescription')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>{t('sentimentAnalysisTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('sentimentAnalysisDescription')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>{t('riskManagementTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('riskManagementDescription')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle>{t('tradingStrategiesTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('tradingStrategiesDescription')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>{t('multiAgentCollaborationTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('featuresTitle')}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t('institutionalQuality')}
              </p>
              
              <div className="space-y-4">
                {/* <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Real-time Analysis</h3>
                    <p className="text-gray-600">Get instant insights as market conditions change</p>
                  </div>
                </div> */}
                
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('tradingStrategiesTitle')}</h3>
                    <p className="text-gray-600">{t('tradingStrategiesDescription')}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('multiAgentCollaborationTitle')}</h3>
                    <p className="text-gray-600">{t('multiAgentCollaborationDescription')}</p>
                  </div>
                </div>
                
                {/* <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Scalable Solutions</h3>
                    <p className="text-gray-600">From individual investors to institutional clients</p>
                  </div>
                </div> */}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
              <div className="text-center">
                {user ? (
                  hasActiveSubscription ? (
                    // Active subscriber
                    <>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {t('memberWelcomeTitle')}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {t('memberWelcomeDescription')}
                      </p>
                      <Link href="/analysis">
                        <Button size="lg" className="w-full">
                          {t('viewAnalysis')}
                        </Button>
                      </Link>
                    </>
                  ) : (
                    // Signed in but no subscription
                    <>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {t('upgradeTitle')}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {t('upgradeDescription')}
                      </p>
                      <Button 
                        size="lg" 
                        className="w-full"
                        onClick={() => createCheckoutSession()}
                      >
                        {t('upgradeNow')}
                      </Button>
                    </>
                  )
                ) : (
                  // Not signed in
                  <>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('joinTitle')}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {t('joinDescription')}
                    </p>
                    <Link href="/login">
                      <Button size="lg" className="w-full">
                        {t('signUpNow')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">{t('disclaimerTitle')}</h3>
            <p className="text-sm text-red-700">
              {t('disclaimerText')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
