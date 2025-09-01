'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, Shield, Database, Eye, Bell, Download } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-500 hover:text-blue-600 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Controller “Who we are” */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Controller “Who we are”</h2>
            </div>
            
            <div className="space-y-4 text-gray-600">
              <p>
                William Wadby s.r.o.
                Registered: Tupeho 34, Bratislava 831 01, Slovakia
                Company ID (IČO): 53583671
                VAT ID (IČ DPH): SK2121421643
                Registered in the Obchodný register Okresného súdu Bratislava III, oddiel: Sro, vložka č. 150525/B
                Contact: info@wadby.me
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Information We Collect</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Email address (for account creation and authentication)</li>
                  <li>• Name (optional, from Google sign-in if provided)</li>
                  <li>• Payment information (processed securely by Stripe)</li>
                  <li>• Subscription status and billing history</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Usage Information</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Pages visited and features used within Veloryn</li>
                  <li>• Analysis requests and search queries</li>
                  <li>• Session duration and frequency of use</li>
                  <li>• Device information (browser type, operating system)</li>
                  <li>• IP address and geographic location (city/country level only)</li>
                  <li>• Error logs and technical diagnostics for service improvement</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Financial Analysis Data</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Stock symbols and companies you research</li>
                  <li>• Analysis reports generated for your account</li>
                  <li>• Saved preferences and watchlists</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Data */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">How We Use Your Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Service Delivery</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Provide AI-powered financial analysis and insights</li>
                  <li>• Maintain your account and subscription status</li>
                  <li>• Process payments and manage billing</li>
                  <li>• Deliver customer support and respond to inquiries</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Service Improvement</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Analyze usage patterns to improve our AI models</li>
                  <li>• Enhance user experience and platform performance</li>
                  <li>• Develop new features and capabilities</li>
                  <li>• Ensure system security and prevent abuse</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Communications</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Send important account and subscription updates</li>
                  <li>• Provide customer support and technical assistance</li>
                  <li>• Share relevant educational content (with your consent)</li>
                  <li>• You can withdraw marketing consent at any time via the unsubscribe link or in your account settings.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal bases mapping */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Legal Bases for Processing (EU/UK)</h2>
            <p className="text-gray-600 mb-3">We process personal data only where a lawful basis applies:</p>
            <ul className="text-gray-600 ml-4 space-y-1">
              <li>• <strong>Contract:</strong> account creation, authentication, providing the service, billing, transactional emails.</li>
              <li>• <strong>Legitimate interests:</strong> security, fraud prevention, service analytics/quality, product improvement (you may object at any time).</li>
              <li>• <strong>Consent:</strong> optional educational/marketing emails; you can withdraw consent at any time.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Cookies and Sessions */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Cookies and Session Management</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                <p className="text-gray-600 mb-2">
                  We use essential cookies and session storage to provide our service:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• <strong>Authentication:</strong> Firebase Auth tokens to keep you logged in</li>
                  <li>• <strong>Session Management:</strong> Temporary session data for smooth navigation</li>
                  <li>• <strong>Security:</strong> CSRF protection and secure session handling</li>
                  <li>• <strong>Preferences:</strong> Remember your settings and display preferences</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Session Policies</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Sessions expire after inactivity for security</li>
                  <li>• You can log out manually to end your session immediately</li>
                  <li>• Session data is encrypted and stored securely</li>
                  <li>• We don't use third-party tracking cookies</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">Cookie Consent</p>
                <p className="text-yellow-700 text-sm mt-1">
                  By using Veloryn, you consent to our use of essential cookies required for 
                  the service to function. We do not use tracking or advertising cookies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Data Sharing and Third Parties</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Processors and Recipients</h3>
                <p className="text-gray-600 mb-2">
                  We use trusted processors under data processing agreements:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• <strong>Stripe</strong> (payments, SCA, billing). We do not store full card details.</li>
                  <li>• <strong>Google Cloud Platform / Firebase</strong> (hosting, databases, authentication, logs).</li>
                </ul>
                <p className="text-gray-600 mt-2">
                  Where processing involves countries outside the EEA/UK, we rely on <strong>Standard Contractual Clauses</strong> or equivalent safeguards. 
                  A copy or summary of safeguards is available on request.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Protection Standards</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• All third parties are bound by strict data protection agreements</li>
                  <li>• Data is encrypted in transit and at rest</li>
                  <li>• We never sell or rent your personal information</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Legal Disclosure</h3>
                <p className="text-gray-600">
                  We may disclose your information if required by law, court order, or to protect 
                  the rights, property, or safety of Veloryn, our users, or others.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Data Security and Retention</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Security Measures</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Industry-standard encryption (AES-256) for data at rest</li>
                  <li>• TLS encryption for all data in transit</li>
                  <li>• Multi-factor authentication and secure access controls</li>
                  <li>• Regular security audits and vulnerability assessments</li>
                  <li>• Secure backup and disaster recovery procedures</li>
                  <li>• Employee security training and access restrictions</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Retention</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Account data: Retained while your account is active</li>
                  <li>• Analysis history: Kept for up to 2 years for service improvement</li>
                  <li>• Usage logs: Automatically deleted after 90 days</li>
                  <li>• Payment records: Retained for 7 years for legal compliance</li>
                  <li>• Deleted account data: Permanently removed within 30 days</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Breach Notification</h3>
                <p className="text-gray-600">
                  In the unlikely event of a personal data breach posing a high risk to your rights and freedoms, 
                  we will inform affected users <strong>without undue delay</strong> and provide information on the nature of the breach, 
                  our measures, and recommended steps, in accordance with applicable law.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Download className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Your Rights and Choices</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Access and Control</h3>
                <p className="text-gray-600 mb-2">You have the following rights regarding your personal data:</p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• <strong>Access:</strong> Request a copy of your personal data</li>
                  <li>• <strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li>• <strong>Deletion:</strong> Request deletion of your account and data</li>
                  <li>• <strong>Portability:</strong> Export your data in a machine-readable format</li>
                  <li>• <strong>Restriction:</strong> Limit how we process your data</li>
                  <li>• <strong>Objection:</strong> Object to certain types of data processing</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How to Exercise Your Rights</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-medium mb-2">Contact Us About Your Data</p>
                  <div className="text-blue-700 space-y-1">
                    <p>Email: <strong>info@wadby.me</strong></p>
                    <p>Response Time: Within 30 days</p>
                    <p>Identity Verification: Required for security</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Account Deletion</h3>
                <p className="text-gray-600">
                  You can delete your account at any time through your account settings or by 
                  contacting us. Upon deletion, your personal data will be permanently removed 
                  within 30 days, except for legally required records.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GDPR and Compliance */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">GDPR Compliance and International Transfers</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">EU/UK Data Protection</h3>
                <p className="text-gray-600 mb-2">
                  If you are located in the European Union or United Kingdom, we comply with GDPR and UK GDPR:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Legal basis for processing: Legitimate interest and contract performance</li>
                  <li>• Data minimization: We collect only necessary information</li>
                  <li>• Purpose limitation: Data used only for stated purposes</li>
                  <li>• Automated decision-making: No purely automated decisions affecting you</li>
                  <li>• Right to lodge complaints with your local data protection authority</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">International Data Transfers</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Data may be processed in the United States and other countries</li>
                  <li>• All transfers are protected by adequate safeguards (Standard Contractual Clauses)</li>
                  <li>• Google Cloud Platform provides GDPR-compliant infrastructure</li>
                  <li>• We ensure your data receives equivalent protection regardless of location</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Supervisory Authority</h3>
                <p className="text-gray-600">
                  EU/UK residents have the right to lodge a complaint with their local data 
                  protection authority if they believe their data rights have been violated.
                </p>
                <p className="text-gray-600">
                  You can lodge a complaint with your local authority or with the Slovak Data Protection Authority:
                  <br/>Úrad na ochranu osobných údajov SR – <a className="text-blue-600 underline" href="https://dataprotection.gov.sk/uoou/">dataprotection.gov.sk/uoou/</a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Children's Privacy</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Age Restrictions</h3>
                <p className="text-gray-600">
                  Veloryn is not intended for children. We do not knowingly 
                  collect personal information from children under 18. If you are a parent or 
                  guardian and believe your child has provided us with personal information, 
                  please contact us immediately at info@wadby.me.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Parental Rights</h3>
                <p className="text-gray-600">
                  If we discover that we have collected personal information from a child under 18, 
                  we will promptly delete such information from our systems. Parents have the right 
                  to review, delete, or refuse further collection of their child's information.
                </p>
              </div>

              <p className="text-gray-600">
                We do not knowingly process personal data of children under 16 without appropriate consent as required by law.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Policy Changes */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Policy Updates</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Change Notification</h3>
                <p className="text-gray-600">
                  We may update this Privacy Policy from time to time to reflect changes in our 
                  practices, technology, legal requirements, or other factors. We will notify you 
                  of any material changes by:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4 mt-2">
                  <li>• Email notification to your registered email address</li>
                  <li>• Prominent notice on our website and application</li>
                  <li>• In-app notification when you next log in</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Effective Date</h3>
                <p className="text-gray-600">
                  Changes take effect 30 days after notification, giving you time to review 
                  and decide whether to continue using our service. Your continued use after 
                  the effective date constitutes acceptance of the updated policy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Disclaimers */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-red-900">Important Legal Disclaimers</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Financial Information Disclaimer</h3>
                <p className="text-red-800 text-sm">
                  Veloryn provides AI-generated financial analysis for informational purposes only. 
                  Our analyses are not financial advice, investment insights, or guarantees 
                  of future performance. Always consult with qualified financial professionals 
                  before making investment decisions.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Limitation of Liability</h3>
                <p className="text-red-800 text-sm">
                  To the maximum extent permitted by law, Veloryn shall not be liable for any 
                  indirect, incidental, consequential, or punitive damages arising from your use 
                  of our service, including but not limited to investment losses, data breaches, 
                  or service interruptions.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Data Accuracy</h3>
                <p className="text-red-800 text-sm">
                  While we strive for accuracy, we cannot guarantee that all financial data or 
                  AI-generated analyses are error-free, complete, or current. Users should verify 
                  important information independently.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Download className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-green-900">Contact Us</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Privacy Questions and Requests</h3>
                <div className="text-green-800 space-y-2">
                  <p><strong>Support:</strong> info@wadby.me</p>
                  <p><strong>Response Time:</strong> Within 48 hours for privacy matters</p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-green-200">
                <p className="text-green-700 text-sm">
                  For urgent privacy matters or suspected security incidents, please contact 
                  info@wadby.me immediately with "URGENT" in the subject line.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            This Privacy Policy is effective as of {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} and applies to all users of Veloryn.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            © {new Date().getFullYear()} Veloryn. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
}
