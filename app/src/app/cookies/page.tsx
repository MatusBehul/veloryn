'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, Cookie, Settings, Shield, Eye } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-500 hover:text-blue-600 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Cookie Policy</h1>
          <p className="text-slate-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Cookie className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">What are Cookies?</h2>
            </div>
            
            <div className="space-y-4 text-gray-600">
              <p>
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                allowing us to understand how you use our service.
              </p>
              <p>
                We use cookies and similar technologies to provide core functionality, measure usage 
                and performance, and improve your user experience.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Cookies */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">How We Use Cookies</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                <p className="text-gray-600 mb-2">
                  These cookies are necessary for our website to function properly and cannot be switched off:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• <strong>Authentication:</strong> Keep you logged in to your account</li>
                  <li>• <strong>Security:</strong> Protect against fraud and ensure secure connections</li>
                  <li>• <strong>Language Preferences:</strong> Remember your selected language</li>
                  <li>• <strong>Favourite tickers:</strong> In case of valid membership, we need to know what notifications you want to get</li>
                  <li>• <strong>Session Management:</strong> Remember your preferences during your visit</li>
                  <li>• <strong>Billing:</strong> Process payments securely through Stripe</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Analytics and Performance Cookies</h3>
                <p className="text-gray-600 mb-2">
                  These cookies help us understand how visitors interact with our website:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• <strong>Google Analytics:</strong> Track page views, user behavior, and site performance</li>
                  <li>• <strong>Error Monitoring:</strong> Detect and fix technical issues</li>
                  <li>• <strong>Performance Metrics:</strong> Measure loading times and optimize user experience</li>
                </ul>
                <p className="text-gray-600 mt-2 text-sm">
                  <em>These cookies require your consent and can be disabled through your cookie preferences.</em>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Cookies */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Third-Party Services</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">External Services We Use</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Google Analytics</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      We use Google Analytics to understand how users interact with our website.
                    </p>
                    <p className="text-gray-600 text-sm">
                      <strong>Data collected:</strong> Page views, session duration, user flow, device information
                    </p>
                    <p className="text-gray-600 text-sm">
                      <strong>Privacy:</strong> IP addresses are anonymized, no personally identifiable information is shared
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Stripe (Payment Processing)</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      Stripe handles all payment processing and may set cookies for fraud prevention.
                    </p>
                    <p className="text-gray-600 text-sm">
                      <strong>Data collected:</strong> Payment information, billing details (processed securely)
                    </p>
                    <p className="text-gray-600 text-sm">
                      <strong>Privacy:</strong> Stripe complies with PCI DSS and GDPR requirements
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Firebase (Google Cloud)</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      Our hosting and authentication platform may set essential cookies.
                    </p>
                    <p className="text-gray-600 text-sm">
                      <strong>Data collected:</strong> Authentication tokens, session management
                    </p>
                    <p className="text-gray-600 text-sm">
                      <strong>Privacy:</strong> Google Cloud complies with GDPR and international data protection standards
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Consent */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Your Cookie Choices</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Consent Management</h3>
                <p className="text-gray-600 mb-2">
                  You have control over which cookies we use on your device:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• <strong>Accept All:</strong> Allow all cookies for the best experience</li>
                  <li>• <strong>Reject All:</strong> Only essential cookies will be used</li>
                  <li>• <strong>Manage Preferences:</strong> Choose which types of cookies to allow</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Withdrawing Consent</h3>
                <p className="text-gray-600 mb-2">
                  You can change your cookie preferences at any time:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Click "Cookie Settings" in the website footer</li>
                  <li>• Update your preferences in your account settings</li>
                  <li>• Clear your browser cookies to reset all preferences</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Browser Settings</h4>
                <p className="text-blue-800 text-sm">
                  You can also manage cookies through your browser settings. However, disabling 
                  essential cookies may prevent certain features of Veloryn from working properly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Cookie Retention</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Retention Periods</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• <strong>Session Cookies:</strong> Deleted when you close your browser</li>
                  <li>• <strong>Authentication Cookies:</strong> Expire after 30 days of inactivity</li>
                  <li>• <strong>Preference Cookies:</strong> Stored for up to 1 year</li>
                  <li>• <strong>Analytics Cookies:</strong> Automatically expire after 24 months</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Automatic Cleanup</h3>
                <p className="text-gray-600">
                  We automatically remove expired cookies and regularly review our cookie usage 
                  to ensure we only collect what's necessary for providing our service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Cookie className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-green-900">Questions About Cookies?</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-green-800">
                If you have any questions about our use of cookies or want to exercise your rights, 
                please contact us:
              </p>
              <div className="text-green-800 space-y-2">
                <p><strong>Email:</strong> info@wadby.me</p>
                <p><strong>Subject:</strong> Cookie Policy Inquiry</p>
                <p><strong>Response Time:</strong> Within 48 hours</p>
              </div>
              
              <div className="pt-2 border-t border-green-200">
                <p className="text-green-700 text-sm">
                  For more information about data protection, please see our{' '}
                  <Link href="/privacy" className="underline hover:text-green-800">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            This Cookie Policy is effective as of {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} and applies to all users of Veloryn.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            © {new Date().getFullYear()} Veloryn. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
