'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowLeft, TrendingUp, Brain, Shield, Users, Globe, Zap } from 'lucide-react';

export default function AboutPage() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back_to_home')}
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('about_veloryn')}</h1>
          <p className="text-xl text-gray-600">
            {t('advanced_financial_intelligence')}
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-8">
          <CardContent className="py-8">
            <div className="text-center mb-8">
              <TrendingUp className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('our_mission')}</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('mission_description')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What We Do */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('what_we_do')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <Brain className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{t('ai_powered_analysis')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('ai_analysis_description')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <TrendingUp className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{t('market_intelligence')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('market_intelligence_description')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Shield className="h-8 w-8 text-red-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{t('risk_management')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('risk_management_description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Our Technology */}
        <Card className="mb-8">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('our_technology')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('multi_agent_ai_system')}</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <Zap className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{t('ai_agent_specialized')}</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{t('ai_agent_realtime')}</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{t('ai_agent_ml')}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('data_sources_security')}</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{t('security_enterprise')}</span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{t('security_gdpr')}</span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{t('security_integration')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Values */}
        <Card className="mb-8">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('our_values')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{t('accessibility')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('accessibility_description')}
                </p>
              </div>
              <div className="text-center">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{t('transparency')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('transparency_description')}
                </p>
              </div>
              <div className="text-center">
                <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{t('innovation')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('innovation_description')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('get_started')}</h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            {t('get_started_description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" className="text-lg px-8 py-3">
                {t('explore_features')}
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                {t('contact_us')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
