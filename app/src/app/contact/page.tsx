'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Mail, Phone, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('contactPageTitle')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('contactPageSubtitle')}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('contactGetInTouch')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">{t('contactEmail')}</h3>
                  <p className="text-gray-600">{t('contactEmailAddress')}</p>
                  <p className="text-sm text-gray-500">{t('contactEmailResponse')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
