'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, FileText, AlertTriangle, Shield, CreditCard, Users, Scale, Globe, Lock } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-500 hover:text-blue-600 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-slate-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="py-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-8 w-8 text-red-600 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-red-900 mb-2">⚠️ Critical Financial Disclaimer</h2>
                <p className="text-red-800 font-medium mb-2">
                  Veloryn provides AI-generated financial analysis for EDUCATIONAL and INFORMATIONAL purposes ONLY.
                </p>
                <p className="text-red-700 text-sm">
                  Our analyses are NOT financial advice, NOT investment insights, and NOT offers to buy or sell securities. 
                  Past performance does not guarantee future results. All investments carry risk of loss. 
                  You must consult qualified financial advisors before making any investment decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance of Terms */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
            </div>
            
            <div className="space-y-4 text-gray-600">
              <p>
                By accessing and using Veloryn (the "Service"), you agree to be bound by these 
                Terms of Service ("Terms") and our Privacy Policy. If you do not agree to these terms, 
                please do not use our service.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you and Veloryn. We may update 
                these Terms at any time with 30 days' notice. Your continued use of the Service after 
                any changes constitutes acceptance of the updated Terms.
              </p>
              <p>
                You must be at least 18 years old to use Veloryn. 
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">2. Service Description</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What Veloryn Provides</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• <strong>Standard Tier:</strong> AI-generated financial analysis, email reports, custom ticker lists, historical data access</li>
                  <li>• <strong>Premium Tier:</strong> All Standard features plus bigger daily emails limit, priority support</li>
                  <li>• Technical analysis, sentiment tracking, and risk assessment tools</li>
                  <li>• Data visualization and reporting features</li>
                  <li>• Market research and analysis compilation services</li>
                  <li>• Educational content about financial markets and investment concepts</li>
                  <li>• Historical data analysis and trend identification</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What Veloryn Does NOT Provide</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <ul className="text-yellow-800 space-y-1 ml-4 text-sm">
                    <li>• Financial advice, investment insights, or personalized investment strategies</li>
                    <li>• Guaranteed returns, profit predictions, or investment performance warranties</li>
                    <li>• Licensed financial advisory, brokerage, or investment management services</li>
                    <li>• Direct investment execution, trading services, or portfolio management</li>
                    <li>• Tax advice, legal counsel, or regulatory compliance guidance</li>
                    <li>• Insurance products, banking services, or credit offerings</li>
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
              <h2 className="text-xl font-semibold text-gray-900">3. User Responsibilities and Conduct</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Account Security and Management</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Maintain the confidentiality and security of your account credentials</li>
                  <li>• Notify us immediately of any unauthorized access or security breaches</li>
                  <li>• Use strong passwords and enable two-factor authentication when available</li>
                  <li>• You are solely responsible for all activities under your account</li>
                  <li>• Provide accurate and complete registration information</li>
                  <li>• Keep your account information current and up-to-date</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Acceptable Use Policy</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Use Veloryn only for lawful purposes and personal/educational use</li>
                  <li>• Comply with all applicable laws, regulations, and third-party rights</li>
                  <li>• Respect intellectual property rights and terms of use</li>
                  <li>• Use the Service in a manner consistent with its educational purpose</li>
                  <li>• Report any bugs, security vulnerabilities, or service issues promptly</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Strictly Prohibited Activities</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <ul className="text-red-800 space-y-1 ml-4 text-sm">
                    <li>• Reverse engineering, copying, or attempting to extract our AI models or algorithms</li>
                    <li>• Using our analysis to provide financial advice or investment services to others</li>
                    <li>• Redistributing, reselling, or commercially exploiting our content without authorization</li>
                    <li>• Market manipulation, insider trading, or other illegal financial activities</li>
                    <li>• Creating multiple accounts to circumvent subscription limits or billing</li>
                    <li>• Sharing account access with unauthorized third parties</li>
                    <li>• Using automated scripts, bots, or scraping tools to access our Service</li>
                    <li>• Attempting to overwhelm, disrupt, or compromise our systems or security</li>
                    <li>• Uploading malicious code, viruses, or harmful content</li>
                    <li>• Impersonating others or providing false identity information</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Investment Decision Responsibility</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm font-medium mb-2">
                    Critical Acknowledgment: By using Veloryn, you acknowledge and agree that:
                  </p>
                  <ul className="text-yellow-800 space-y-1 ml-4 text-sm">
                    <li>• All investment decisions are your sole responsibility</li>
                    <li>• You will seek qualified professional advice before making investment decisions</li>
                    <li>• You understand the risks associated with financial markets and investments</li>
                    <li>• Veloryn is not liable for any investment losses or missed opportunities</li>
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
              <h2 className="text-xl font-semibold text-gray-900">4. Subscription, Billing, and Payment Terms</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Subscription Plans and Pricing</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• <strong>Standard:</strong> €2 per month - Full AI analysis with basic email capacity (up to 5 daily emails)</li>
                  <li>• <strong>Premium:</strong> €10 per month - Enhanced analysis with priority support (up to 20 daily emails)</li>
                  <li>• All subscriptions automatically renew unless cancelled before the next billing cycle</li>
                  <li>• Full access to tier-appropriate AI analysis features and content</li>
                  <li>• Pricing subject to change with 30 days' advance notice</li>
                  <li>• New pricing applies to subsequent billing cycles after notice period</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment Processing and Security</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• All payments processed securely through Stripe, our payment processor</li>
                  <li>• We do not store your payment card information on our servers</li>
                  <li>• Billing occurs at the start of each subscription period</li>
                  <li>• Failed payments may result in service suspension after grace period</li>
                  <li>• You must provide valid payment information and authorize automatic billing</li>
                  <li>• All fees are exclusive of applicable taxes, which you are responsible for</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Cancellation and Refund Policy</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-blue-800 space-y-2 text-sm">
                    <p><strong>Cancellation:</strong></p>
                    <ul className="ml-4 space-y-1">
                      <li>• Cancel anytime through your account settings or Stripe billing portal</li>
                      <li>• Cancellation takes effect at the end of your current billing period</li>
                      <li>• You retain full access to premium features until subscription expires</li>
                      <li>• No cancellation fees or penalties</li>
                    </ul>
                    <p><strong>Refunds:</strong></p>
                    <ul className="ml-4 space-y-1">
                      <li>• No refunds for partial months or unused portions of subscription periods</li>
                      <li>• Refunds may be provided at our discretion for technical issues or service failures</li>
                      <li>• Refund requests must be submitted within 30 days of billing</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Free Trial and Promotional Offers</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Free trials or promotional offers may be available for new users</li>
                  <li>• Trial periods automatically convert to paid subscriptions unless cancelled</li>
                  <li>• Promotional pricing is limited-time and subject to specific terms</li>
                  <li>• One free trial per user; additional trials require our approval</li>
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
              <h2 className="text-xl font-semibold text-gray-900">5. Disclaimers and Risk Acknowledgments</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Financial and Investment Disclaimers</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-medium mb-3">
                    CRITICAL INVESTMENT RISK DISCLOSURE:
                  </p>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• <strong>NOT FINANCIAL ADVICE:</strong> All content is for educational purposes only</li>
                    <li>• <strong>NO GUARANTEES:</strong> Past performance does not predict future results</li>
                    <li>• <strong>INVESTMENT RISKS:</strong> All investments carry risk of total loss</li>
                    <li>• <strong>AI LIMITATIONS:</strong> AI analysis may contain errors, biases, or inaccuracies</li>
                    <li>• <strong>MARKET VOLATILITY:</strong> Financial markets are unpredictable and volatile</li>
                    <li>• <strong>PROFESSIONAL ADVICE REQUIRED:</strong> Consult qualified advisors before investing</li>
                    <li>• <strong>NO LICENSED SERVICES:</strong> We are not licensed financial advisors or brokers</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Service Availability and Performance</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• We strive for 99.9% uptime but cannot guarantee uninterrupted service</li>
                  <li>• Scheduled maintenance windows may temporarily limit access</li>
                  <li>• Third-party data providers may experience outages affecting our service</li>
                  <li>• AI models may occasionally produce unexpected or erroneous results</li>
                  <li>• Internet connectivity issues may impact your access to the Service</li>
                  <li>• We reserve the right to modify or discontinue features with notice</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Accuracy and Reliability</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Financial data is sourced from third parties and may contain errors or delays</li>
                  <li>• AI analysis is based on historical data and algorithmic models</li>
                  <li>• Market conditions can change rapidly, making analysis outdated</li>
                  <li>• We do not warrant the accuracy, completeness, or timeliness of any data</li>
                  <li>• Users should verify important information through independent sources</li>
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
              <h2 className="text-xl font-semibold text-gray-900">6. Limitation of Liability and Indemnification</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Limitation of Liability</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-800 font-medium mb-2">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4">
                    <li>• Veloryn's total liability is limited to the amount you paid in the 12 months prior to the claim</li>
                    <li>• We are not liable for any indirect, incidental, consequential, or punitive damages</li>
                    <li>• We are not liable for investment losses, missed opportunities, or financial damages</li>
                    <li>• We are not liable for losses due to service interruptions, data breaches, or technical failures</li>
                    <li>• We are not liable for third-party actions, data, or services</li>
                    <li>• We are not liable for damages arising from your violation of these Terms</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">User Indemnification</h3>
                <p className="text-gray-600 mb-2">
                  You agree to indemnify and hold harmless Veloryn and its officers, directors, employees, 
                  and agents from any claims, damages, or expenses arising from:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Your use of the Service or reliance on our analysis</li>
                  <li>• Your investment decisions or financial losses</li>
                  <li>• Your violation of these Terms or applicable laws</li>
                  <li>• Your infringement of third-party rights</li>
                  <li>• Your negligent or wrongful conduct</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Force Majeure</h3>
                <p className="text-gray-600">
                  Veloryn is not liable for any failure to perform due to circumstances beyond our reasonable 
                  control, including natural disasters, government actions, pandemics, cyber attacks, or 
                  infrastructure failures.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">7. Intellectual Property Rights</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Veloryn's Intellectual Property</h3>
                <p className="text-gray-600 mb-2">
                  Veloryn retains all rights, title, and interest in and to the Service, including:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• AI models, algorithms, and analysis methodologies</li>
                  <li>• Software, platform design, and user interface</li>
                  <li>• Trademarks, logos, and branding materials</li>
                  <li>• Proprietary analysis frameworks and data processing techniques</li>
                  <li>• Documentation, training materials, and educational content</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">User License</h3>
                <p className="text-gray-600 mb-2">
                  We grant you a limited, non-exclusive, non-transferable, revocable license to:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Access and use the Service for personal, non-commercial purposes</li>
                  <li>• View and download analysis reports for your own educational use</li>
                  <li>• Use our Service in compliance with these Terms</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">User Content and Data</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• You retain ownership of any data you input to our system</li>
                  <li>• You grant us a license to use your data to provide and improve our services</li>
                  <li>• We may use aggregated, anonymized data for analytics and service enhancement</li>
                  <li>• Analysis reports generated for you remain your property for personal use</li>
                  <li>• We may retain copies of analysis for service improvement and quality assurance</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Restrictions on Use</h3>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-orange-800 text-sm font-medium mb-2">You may NOT:</p>
                  <ul className="text-orange-700 text-sm space-y-1 ml-4">
                    <li>• Copy, modify, or create derivative works of our Service</li>
                    <li>• Reverse engineer, decompile, or attempt to extract our source code</li>
                    <li>• Use our Service to create competing products or services</li>
                    <li>• Remove or alter any proprietary notices or branding</li>
                    <li>• Sublicense, redistribute, or transfer your access rights</li>
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
              <h2 className="text-xl font-semibold text-gray-900">8. Privacy and Data Protection</h2>
            </div>
            
            <div className="space-y-4 text-gray-600">
              <p>
                Your privacy is important to us. Our Privacy Policy, which is incorporated into these Terms 
                by reference, explains how we collect, use, and protect your personal information.
              </p>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Key Privacy Commitments</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• We comply with GDPR, CCPA, and other applicable privacy laws</li>
                  <li>• We use industry-standard encryption to protect your data</li>
                  <li>• We never sell your personal information to third parties</li>
                  <li>• You have rights to access, correct, and delete your data</li>
                  <li>• We provide clear notice of any material changes to our privacy practices</li>
                </ul>
              </div>
              
              <p>
                For complete details about our privacy practices, please review our 
                <Link href="/privacy" className="text-blue-600 underline"> Privacy Policy</Link>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">9. Account Termination and Suspension</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Termination by User</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• You may terminate your account at any time through account settings</li>
                  <li>• Subscription cancellation can be done through your billing portal</li>
                  <li>• Account deletion results in permanent loss of all data and analysis history</li>
                  <li>• We may retain certain information as required by law or for legitimate business purposes</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Termination by Veloryn</h3>
                <p className="text-gray-600 mb-2">
                  We may suspend or terminate your account immediately if you:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Violate these Terms of Service or our Privacy Policy</li>
                  <li>• Engage in prohibited activities or misuse our Service</li>
                  <li>• Fail to pay subscription fees after reasonable notice</li>
                  <li>• Provide false information or engage in fraudulent activity</li>
                  <li>• Pose a security risk or threaten the integrity of our Service</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Effect of Termination</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Your right to access and use the Service immediately ceases</li>
                  <li>• All licenses granted to you under these Terms are revoked</li>
                  <li>• You remain liable for any fees owed prior to termination</li>
                  <li>• Sections regarding liability, indemnification, and disputes survive termination</li>
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
              <h2 className="text-xl font-semibold text-gray-900">10. Governing Law and Dispute Resolution</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Applicable Law</h3>
                <p className="text-gray-600">
                  These Terms are governed by and construed in accordance with the laws of the European Union 
                  and the jurisdiction where Veloryn is incorporated, without regard to conflict of law principles.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Dispute Resolution Process</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm font-medium mb-2">We encourage resolving disputes through these steps:</p>
                  <ol className="text-blue-700 text-sm space-y-1 ml-4 list-decimal">
                    <li><strong>Direct Communication:</strong> Contact our support team at info@wadby.me</li>
                    <li><strong>Informal Resolution:</strong> We'll work with you to resolve issues within 30 days</li>
                    <li><strong>Mediation:</strong> If needed, we may agree to mediation through a neutral third party</li>
                    <li><strong>Arbitration/Courts:</strong> As a last resort, disputes may proceed to binding arbitration or courts</li>
                  </ol>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Jurisdiction and Venue</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Any legal proceedings must be brought in the courts of our jurisdiction</li>
                  <li>• You consent to the personal jurisdiction of such courts</li>
                  <li>• EU residents may have additional rights under European law</li>
                  <li>• Consumer protection laws may provide additional remedies</li>
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
              <h2 className="text-xl font-semibold text-gray-900">11. Changes to Terms and Service</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Terms Updates</h3>
                <p className="text-gray-600 mb-2">
                  We may update these Terms from time to time to reflect:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Changes in our services or business practices</li>
                  <li>• Legal or regulatory requirements</li>
                  <li>• Security or technical improvements</li>
                  <li>• User feedback and service enhancements</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Notification Process</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Material changes will be announced with 30 days' advance notice</li>
                  <li>• Notification via email to your registered email address</li>
                  <li>• Prominent notice on our website and in the Service</li>
                  <li>• Updated "Last Updated" date at the top of these Terms</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Service Modifications</h3>
                <p className="text-gray-600">
                  We reserve the right to modify, suspend, or discontinue any part of our Service at any time. 
                  We will provide reasonable notice for significant changes that affect core functionality.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-green-900">12. Contact Information</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-green-800 mb-4">
                Questions about these Terms of Service? We're here to help:
              </p>
              
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Legal and Terms Questions</h3>
                <div className="text-green-800 space-y-2">
                  <p><strong>Support:</strong> info@wadby.me</p>
                  <p><strong>Response Time:</strong> Within 48 hours for terms-related inquiries</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-green-900 mb-2">General Support</h3>
                <div className="text-green-800 space-y-1">
                  <p><strong>Support:</strong> info@wadby.me</p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-green-200">
                <p className="text-green-700 text-sm">
                  For urgent legal matters or compliance issues, please email info@wadby.me 
                  with "URGENT" in the subject line.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acknowledgment */}
        <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-blue-900">Terms Acknowledgment</h3>
          </div>
          <p className="text-blue-800 font-medium mb-3">
            By using Veloryn, you acknowledge that you have read, understood, and agree to be bound by these 
            Terms of Service and our Privacy Policy.
          </p>
          <div className="bg-blue-100 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-2">You specifically acknowledge and understand that:</p>
            <ul className="text-left space-y-1 ml-4">
              <li>• Veloryn provides educational content only, not financial advice</li>
              <li>• All investment decisions are your sole responsibility</li>
              <li>• You should consult qualified financial advisors before investing</li>
              <li>• Past performance does not guarantee future results</li>
              <li>• All investments carry risk of loss</li>
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200 mt-8">
          <p className="text-gray-500 text-sm">
            These Terms of Service are effective as of August 22, 2025 and apply to all users of Veloryn.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            © {new Date().getFullYear()} Veloryn. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
}
