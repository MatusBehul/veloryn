'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, FileText, AlertTriangle, Shield, CreditCard, Users, Scale, Globe, Lock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-500 hover:text-blue-600 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToHome')}
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{t('termsTitle')}</h1>
          <p className="text-slate-600">
            {t('termsLastUpdated')}: September 1, 2025
          </p>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="py-6">
            <div className="flex items-start space-x-4">
              <div>
                <h2 className="text-xl font-semibold text-red-900 mb-2">{t('importantNoticeTitle')}</h2>
                <p className="text-red-800 font-medium mb-2">
                  {t('importantNoticeText1')}
                </p>
                <p className="text-red-700 text-sm">
                  {t('importantNoticeText2')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">0. {t('companyInformationTitle')}</h2>
            </div>
            
            <div className="space-y-4 text-gray-600">
                <p>William Wadby s.r.o.</p>
                <p>Registered: Tupeho 34, Bratislava 831 01, Slovakia</p>
                <p>Company ID (IČO): 53583671</p>
                <p>VAT ID (IČ DPH): SK2121421643</p>
                <p>Registered in the Obchodný register Okresného súdu Bratislava III, oddiel: Sro, vložka č. 150525/B</p>
                <p>Contact: info@wadby.me</p>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance of Terms */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">1. {t('acceptanceOfTermsTitle')}</h2>
            </div>
            
            <div className="space-y-4 text-gray-600">
              <p>{t('acceptanceOfTermsText1')}</p>
              <p>{t('acceptanceOfTermsText2')}</p>
              <p>{t('acceptanceOfTermsText3')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">2. {t('serviceDescriptionTitle')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('serviceDescriptionText1')}</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• <strong>Standard Tier:</strong> {t('serviceDescriptionText2')}</li>
                  <li>• <strong>Premium Tier:</strong> {t('serviceDescriptionText3')}</li>
                  <li>• {t('serviceDescriptionText4')}</li>
                  <li>• {t('serviceDescriptionText5')}</li>
                  <li>• {t('serviceDescriptionText6')}</li>
                  <li>• {t('serviceDescriptionText7')}</li>
                  <li>• {t('serviceDescriptionText8')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('serviceDescriptionText9')}</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <ul className="text-yellow-800 space-y-1 ml-4 text-sm">
                    <li>• {t('serviceDescriptionText10')}</li>
                    <li>• {t('serviceDescriptionText11')}</li>
                    <li>• {t('serviceDescriptionText12')}</li>
                    <li>• {t('serviceDescriptionText13')}</li>
                    <li>• {t('serviceDescriptionText14')}</li>
                    <li>• {t('serviceDescriptionText15')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">3. {t('userResponsibilitiesTitle')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('userResponsibilitiesText1')}</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('userResponsibilitiesText2')}</li>
                  <li>• {t('userResponsibilitiesText3')}</li>
                  <li>• {t('userResponsibilitiesText4')}</li>
                  <li>• {t('userResponsibilitiesText5')}</li>
                  <li>• {t('userResponsibilitiesText6')}</li>
                  <li>• {t('userResponsibilitiesText7')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('userResponsibilitiesText8')}</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('userResponsibilitiesText9')}</li>
                  <li>• {t('userResponsibilitiesText10')}</li>
                  <li>• {t('userResponsibilitiesText11')}</li>
                  <li>• {t('userResponsibilitiesText12')}</li>
                  <li>• {t('userResponsibilitiesText13')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('userResponsibilitiesText14')}</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <ul className="text-red-800 space-y-1 ml-4 text-sm">
                    <li>• {t('userResponsibilitiesText15')}</li>
                    <li>• {t('userResponsibilitiesText16')}</li>
                    <li>• {t('userResponsibilitiesText17')}</li>
                    <li>• {t('userResponsibilitiesText18')}</li>
                    <li>• {t('userResponsibilitiesText19')}</li>
                    <li>• {t('userResponsibilitiesText20')}</li>
                    <li>• {t('userResponsibilitiesText21')}</li>
                    <li>• {t('userResponsibilitiesText22')}</li>
                    <li>• {t('userResponsibilitiesText23')}</li>
                    <li>• {t('userResponsibilitiesText24')}</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('userResponsibilitiesText25')}</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm font-medium mb-2">{t('userResponsibilitiesText26')}</p>
                  <ul className="text-yellow-800 space-y-1 ml-4 text-sm">
                    <li>• {t('userResponsibilitiesText27')}</li>
                    <li>• {t('userResponsibilitiesText28')}</li>
                    <li>• {t('userResponsibilitiesText29')}</li>
                    <li>• {t('userResponsibilitiesText30')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Terms */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">4. {t('subscriptionTermsTitle')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('subscriptionTermsText1')}</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('subscriptionTermsText2')}</li>
                  <li>• {t('subscriptionTermsText3')}</li>
                  <li>• {t('subscriptionTermsText4')}</li>
                  <li>• {t('subscriptionTermsText5')}</li>
                  <li>• {t('subscriptionTermsText6')}</li>
                  <li>• {t('subscriptionTermsText7')}</li>
                  <li>• {t('subscriptionTermsText8')}</li>
                  <li>• {t('subscriptionTermsText9')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('subscriptionTermsText10')}</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('subscriptionTermsText11')}</li>
                  <li>• {t('subscriptionTermsText12')}</li>
                  <li>• {t('subscriptionTermsText13')}</li>
                  <li>• {t('subscriptionTermsText14')}</li>
                  <li>• {t('subscriptionTermsText15')}</li>
                  <li>• {t('subscriptionTermsText16')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('subscriptionTermsText17')}</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-blue-800 space-y-2 text-sm">
                    <p><strong>{t('subscriptionTermsText18')}:</strong></p>
                    <ul className="ml-4 space-y-1">
                      <li>• {t('subscriptionTermsText19')}</li>
                      <li>• {t('subscriptionTermsText20')}</li>
                      <li>• {t('subscriptionTermsText21')}</li>
                      <li>• {t('subscriptionTermsText22')}</li>
                    </ul>
                    <p><strong>{t('subscriptionTermsText23')}:</strong></p>
                    <ul className="ml-4 space-y-1">
                      <li>• {t('subscriptionTermsText24')}</li>
                      <li>• {t('subscriptionTermsText25')}</li>
                      <li>• {t('subscriptionTermsText26')}</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('subscriptionTermsText27')}</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('subscriptionTermsText28')}</li>
                  <li>• {t('subscriptionTermsText29')}</li>
                  <li>• {t('subscriptionTermsText30')}</li>
                  <li>• {t('subscriptionTermsText31')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('subscriptionTermsText32')}</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('subscriptionTermsText33')}</li>
                  <li>• {t('subscriptionTermsText34')}</li>
                  <li>• {t('subscriptionTermsText35')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('subscriptionTermsText36')}</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('subscriptionTermsText37')}</li>
                  <li>• {t('subscriptionTermsText38')}</li>
                  <li>• {t('subscriptionTermsText39')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('subscriptionTermsText40')}</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('subscriptionTermsText41')}</li>
                  <li>• {t('subscriptionTermsText42')}</li>
                  <li>• {t('subscriptionTermsText43')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right of Withdrawal (EU Consumers Only) */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">4A. {t('rightOfWithdrawalTitle')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('rightOfWithdrawalText1')}</li>
                  <li>• {t('rightOfWithdrawalText2')}</li>
                  <li>• {t('rightOfWithdrawalText3')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers and Limitations */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">5. {t('disclaimersAndLimitationsTitle')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('disclaimersAndLimitationsText1')}</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-medium mb-3">
                    {t('disclaimersAndLimitationsText2')}:
                  </p>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• {t('disclaimersAndLimitationsText3')}</li>
                    <li>• {t('disclaimersAndLimitationsText4')}</li>
                    <li>• {t('disclaimersAndLimitationsText5')}</li>
                    <li>• {t('disclaimersAndLimitationsText6')}</li>
                    <li>• {t('disclaimersAndLimitationsText7')}</li>
                    <li>• {t('disclaimersAndLimitationsText8')}</li>
                    <li>• {t('disclaimersAndLimitationsText9')}</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('disclaimersAndLimitationsText10')}</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('disclaimersAndLimitationsText11')}</li>
                  <li>• {t('disclaimersAndLimitationsText12')}</li>
                  <li>• {t('disclaimersAndLimitationsText13')}</li>
                  <li>• {t('disclaimersAndLimitationsText14')}</li>
                  <li>• {t('disclaimersAndLimitationsText15')}</li>
                  <li>• {t('disclaimersAndLimitationsText16')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('disclaimersAndLimitationsText17')}</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('disclaimersAndLimitationsText18')}</li>
                  <li>• {t('disclaimersAndLimitationsText19')}</li>
                  <li>• {t('disclaimersAndLimitationsText20')}</li>
                  <li>• {t('disclaimersAndLimitationsText21')}</li>
                  <li>• {t('disclaimersAndLimitationsText22')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Scale className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">6. {t('limitationOfLiabilityTitle')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('limitationOfLiabilityText1')}</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-800 font-medium mb-2">
                    {t('limitationOfLiabilityText2')}:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4">
                    <li>• {t('limitationOfLiabilityText3')}</li>
                    <li>• {t('limitationOfLiabilityText4')}</li>
                    <li>• {t('limitationOfLiabilityText5')}</li>
                    <li>• {t('limitationOfLiabilityText6')}</li>
                    <li>• {t('limitationOfLiabilityText7')}</li>
                    <li>• {t('limitationOfLiabilityText8')}</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('limitationOfLiabilityText9')}</h3>
                <p className="text-gray-600 mb-2">{t('limitationOfLiabilityText10')}</p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('limitationOfLiabilityText11')}</li>
                  <li>• {t('limitationOfLiabilityText12')}</li>
                  <li>• {t('limitationOfLiabilityText13')}</li>
                  <li>• {t('limitationOfLiabilityText14')}</li>
                  <li>• {t('limitationOfLiabilityText15')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('limitationOfLiabilityText16')}</h3>
                <p className="text-gray-600">{t('limitationOfLiabilityText17')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">7. {t('intellectualPropertyTitle')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('intellectualPropertyText1')}</h3>
                <p className="text-gray-600 mb-2">{t('intellectualPropertyText2')}</p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('intellectualPropertyText3')}</li>
                  <li>• {t('intellectualPropertyText4')}</li>
                  <li>• {t('intellectualPropertyText5')}</li>
                  <li>• {t('intellectualPropertyText6')}</li>
                  <li>• {t('intellectualPropertyText7')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('intellectualPropertyText8')}</h3>
                <p className="text-gray-600 mb-2">{t('intellectualPropertyText9')}</p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('intellectualPropertyText10')}</li>
                  <li>• {t('intellectualPropertyText11')}</li>
                  <li>• {t('intellectualPropertyText12')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('intellectualPropertyText13')}</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('intellectualPropertyText14')}</li>
                  <li>• {t('intellectualPropertyText15')}</li>
                  <li>• {t('intellectualPropertyText16')}</li>
                  <li>• {t('intellectualPropertyText17')}</li>
                  <li>• {t('intellectualPropertyText18')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('intellectualPropertyText19')}</h3>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-orange-800 text-sm font-medium mb-2">{t('intellectualPropertyText20')}:</p>
                  <ul className="text-orange-700 text-sm space-y-1 ml-4">
                    <li>• {t('intellectualPropertyText21')}</li>
                    <li>• {t('intellectualPropertyText22')}</li>
                    <li>• {t('intellectualPropertyText23')}</li>
                    <li>• {t('intellectualPropertyText24')}</li>
                    <li>• {t('intellectualPropertyText25')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy and Data Protection */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">8. {t('privacyAndDataProtectionTitle')}</h2>
            </div>
            
            <div className="space-y-4 text-gray-600">              
              <div>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('privacyAndDataProtectionText1')} <Link href="/privacy" className="text-blue-600 underline"> Privacy Policy</Link>.</li>
                  <li>• {t('privacyAndDataProtectionText2')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">9. {t('accountTerminationAndSuspensionTitle')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('accountTerminationAndSuspensionText1')}</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('accountTerminationAndSuspensionText2')}</li>
                  <li>• {t('accountTerminationAndSuspensionText3')}</li>
                  <li>• {t('accountTerminationAndSuspensionText4')}</li>
                  <li>• {t('accountTerminationAndSuspensionText5')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('accountTerminationAndSuspensionText6')}</h3>
                <p className="text-gray-600 mb-2">
                  {t('accountTerminationAndSuspensionText7')}:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('accountTerminationAndSuspensionText8')}</li>
                  <li>• {t('accountTerminationAndSuspensionText9')}</li>
                  <li>• {t('accountTerminationAndSuspensionText10')}</li>
                  <li>• {t('accountTerminationAndSuspensionText11')}</li>
                  <li>• {t('accountTerminationAndSuspensionText12')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('accountTerminationAndSuspensionText13')}</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('accountTerminationAndSuspensionText14')}</li>
                  <li>• {t('accountTerminationAndSuspensionText15')}</li>
                  <li>• {t('accountTerminationAndSuspensionText16')}</li>
                  <li>• {t('accountTerminationAndSuspensionText17')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">10. {t('governingLawTitle')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('governingLawText1')}</h3>
                <p className="text-gray-600">{t('governingLawText2')}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('governingLawText3')}</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm font-medium mb-2">{t('governingLawText4')}:</p>
                  <ol className="text-blue-700 text-sm space-y-1 ml-4 list-decimal">
                    <li>{t('governingLawText5')} info@wadby.me</li>
                    <li>{t('governingLawText6')}</li>
                    <li>{t('governingLawText7')}</li>
                    <li>{t('governingLawText8')}</li>
                  </ol>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('governingLawText9')}</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('governingLawText10')}</li>
                  <li>• {t('governingLawText11')}</li>
                  <li>• {t('governingLawText12')}</li>
                  <li>• {t('governingLawText13')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('governingLawText14')}</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('governingLawText15')} https://ec.europa.eu/consumers/odr/ .</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates and Changes */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">11. {t('updatesAndChangesTitle')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('updatesAndChangesText1')}</h3>
                <p className="text-gray-600 mb-2">{t('updatesAndChangesText2')}:</p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('updatesAndChangesText3')}</li>
                  <li>• {t('updatesAndChangesText4')}</li>
                  <li>• {t('updatesAndChangesText5')}</li>
                  <li>• {t('updatesAndChangesText6')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('updatesAndChangesText7')}</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• {t('updatesAndChangesText8')}</li>
                  <li>• {t('updatesAndChangesText9')}</li>
                  <li>• {t('updatesAndChangesText10')}</li>
                  <li>• {t('updatesAndChangesText11')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('updatesAndChangesText12')}</h3>
                <p className="text-gray-600">{t('updatesAndChangesText13')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-green-900">12. {t('contactInformationTitle')}</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-green-800 mb-4">{t('contactInformationText1')}:</p>
              <div>
                <h3 className="font-semibold text-green-900 mb-2">{t('contactInformationText2')}</h3>
                <div className="text-green-800 space-y-2">
                  <p><strong>{t('contactInformationText3')}:</strong> info@wadby.me</p>
                  <p>{t('contactInformationText4')}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-green-900 mb-2">{t('contactInformationText5')}</h3>
                <div className="text-green-800 space-y-1">
                  <p><strong>{t('contactInformationText6')}:</strong> info@wadby.me</p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-green-200">
                <p className="text-green-700 text-sm">{t('contactInformationText7')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-green-900">13. {t('accessibilityTitle')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-green-900 mb-2">{t('accessibilityTitle')}</h3>
                <div className="text-green-800 space-y-2">
                  <p>{t('accessibilityText1')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acknowledgment */}
        <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-blue-900">{t('termsAcknowledgmentTitle')}</h3>
          </div>
          <p className="text-blue-800 font-medium mb-3">{t('termsAcknowledgmentText1')}</p>
          <div className="bg-blue-100 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-2">{t('termsAcknowledgmentText2')}:</p>
            <ul className="text-left space-y-1 ml-4">
              <li>• {t('termsAcknowledgmentText3')}</li>
              <li>• {t('termsAcknowledgmentText4')}</li>
              <li>• {t('termsAcknowledgmentText5')}</li>
              <li>• {t('termsAcknowledgmentText6')}</li>
              <li>• {t('termsAcknowledgmentText7')}</li>
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200 mt-8">
          <p className="text-gray-500 text-sm">{t('termsFooter1')}</p>
          <p className="text-gray-500 text-sm mt-2">
            © {new Date().getFullYear()} Veloryn. {t('termsFooter2')}
          </p>
        </div>

      </div>
    </div>
  );
}
