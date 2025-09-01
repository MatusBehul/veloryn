'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, Accessibility, CheckCircle, AlertTriangle, Mail, ExternalLink } from 'lucide-react';

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-500 hover:text-blue-600 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Accessibility Statement</h1>
          <p className="text-slate-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Accessibility className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Our Commitment to Accessibility</h2>
            </div>
            
            <div className="space-y-4 text-gray-600">
              <p>
                Veloryn is committed to ensuring accessibility of its digital services in compliance 
                with the <strong>European Accessibility Act (EAA 2025)</strong> and{' '}
                <strong>WCAG 2.1 AA guidelines</strong>. We believe that everyone should have equal 
                access to financial information and analysis tools, regardless of their abilities.
              </p>
              <p>
                We continuously work to improve the accessibility of our platform and welcome 
                feedback from users to help us identify areas for improvement.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Conformance Status */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Conformance Status</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">WCAG 2.1 AA Compliance</h3>
                <p className="text-gray-600 mb-4">
                  We strive for WCAG 2.1 AA compliance across our platform. This includes:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">✅ Areas of Compliance</h4>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• Keyboard navigation support</li>
                      <li>• Screen reader compatibility</li>
                      <li>• High contrast color schemes</li>
                      <li>• Resizable text up to 200%</li>
                      <li>• Focus indicators on interactive elements</li>
                      <li>• Alternative text for images</li>
                      <li>• Semantic HTML structure</li>
                      <li>• Clear heading hierarchy</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">⚠️ Known Limitations</h4>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• Some third-party integrations may not fully conform</li>
                      <li>• Complex financial charts may have limited accessibility</li>
                      <li>• Real-time data updates may not always announce properly</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-2">Third-Party Services</h4>
                    <p className="text-yellow-800 text-sm">
                      Some third-party integrations (Stripe checkout, analytics dashboards) 
                      may not fully conform to WCAG 2.1 AA standards. We work with our partners 
                      to improve accessibility and provide alternative access methods where possible.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Features */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Accessibility className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Accessibility Features</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Navigation and Interaction</h3>
                <ul className="text-gray-600 space-y-2 ml-4">
                  <li>• <strong>Keyboard Navigation:</strong> All interactive elements are accessible via keyboard</li>
                  <li>• <strong>Skip Links:</strong> Quick navigation to main content and key sections</li>
                  <li>• <strong>Focus Management:</strong> Clear visual indicators for focused elements</li>
                  <li>• <strong>Consistent Layout:</strong> Predictable navigation and page structure</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Visual Design</h3>
                <ul className="text-gray-600 space-y-2 ml-4">
                  <li>• <strong>Color Contrast:</strong> All text meets WCAG AA contrast requirements (4.5:1 ratio)</li>
                  <li>• <strong>Scalable Text:</strong> Text can be resized up to 200% without loss of functionality</li>
                  <li>• <strong>Color Independence:</strong> Information is not conveyed by color alone</li>
                  <li>• <strong>Responsive Design:</strong> Works across different screen sizes and orientations</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Screen Reader Support</h3>
                <ul className="text-gray-600 space-y-2 ml-4">
                  <li>• <strong>Semantic HTML:</strong> Proper use of headings, lists, and landmarks</li>
                  <li>• <strong>ARIA Labels:</strong> Descriptive labels for complex UI components</li>
                  <li>• <strong>Alternative Text:</strong> All images include meaningful alt text</li>
                  <li>• <strong>Live Regions:</strong> Important updates are announced to screen readers</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testing and Validation */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Testing and Validation</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Our Testing Process</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Automated accessibility testing with industry-standard tools</li>
                  <li>• Manual testing with keyboard-only navigation</li>
                  <li>• Screen reader testing (NVDA, JAWS, VoiceOver)</li>
                  <li>• Color contrast validation</li>
                  <li>• Regular accessibility audits by external experts</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Assistive Technologies Tested</h3>
                <div className="grid md:grid-cols-2 gap-4 text-gray-600">
                  <div>
                    <h4 className="font-semibold mb-2">Screen Readers:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• NVDA (Windows)</li>
                      <li>• JAWS (Windows)</li>
                      <li>• VoiceOver (macOS/iOS)</li>
                      <li>• TalkBack (Android)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Other Tools:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Voice control software</li>
                      <li>• High contrast mode</li>
                      <li>• Browser zoom up to 200%</li>
                      <li>• Keyboard-only navigation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-blue-900">Feedback and Support</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Report Accessibility Issues</h3>
                <p className="text-blue-800 mb-4">
                  If you encounter accessibility barriers while using Veloryn, please contact us. 
                  Your feedback helps us improve our platform for everyone.
                </p>
                
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Contact Information</h4>
                  <div className="text-blue-800 space-y-2">
                    <p><strong>Email:</strong> info@wadby.me</p>
                    <p><strong>Subject:</strong> Accessibility Issue</p>
                    <p><strong>Response Time:</strong> Within 15 days</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">What to Include in Your Report</h3>
                <ul className="text-blue-800 space-y-1 ml-4 text-sm">
                  <li>• Description of the accessibility barrier</li>
                  <li>• Page or feature where the issue occurs</li>
                  <li>• Assistive technology you're using (if any)</li>
                  <li>• Browser and operating system information</li>
                  <li>• Any error messages you received</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enforcement */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <ExternalLink className="h-6 w-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-orange-900">Enforcement and Complaints</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-orange-900 mb-2">External Enforcement</h3>
                <p className="text-orange-800 mb-4">
                  If you are not satisfied with our response to your accessibility concerns, 
                  you may contact the appropriate enforcement authority.
                </p>
                
                <div className="bg-white border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">Slovak Trade Inspection Authority (SOI)</h4>
                  <div className="text-orange-800 space-y-2 text-sm">
                    <p><strong>Role:</strong> Enforcement body for the European Accessibility Act in Slovakia</p>
                    <p><strong>Website:</strong> <a href="https://www.soi.sk" className="underline hover:text-orange-900" target="_blank" rel="noopener noreferrer">www.soi.sk</a></p>
                    <p><strong>Contact:</strong> Available through their official website</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-orange-900 mb-2">Our Commitment</h3>
                <p className="text-orange-800 text-sm">
                  We are committed to resolving accessibility issues promptly and working 
                  collaboratively with users and authorities to ensure compliance with 
                  applicable accessibility standards.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Future Improvements */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Accessibility className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Ongoing Improvements</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Our Roadmap</h3>
                <p className="text-gray-600 mb-2">
                  We continuously work to improve accessibility across our platform:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Enhanced screen reader support for financial charts and data visualizations</li>
                  <li>• Improved keyboard navigation for complex interactive elements</li>
                  <li>• Better support for voice control and switch navigation</li>
                  <li>• Regular accessibility training for our development team</li>
                  <li>• Quarterly accessibility audits and user testing</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Standards We Follow</h3>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</li>
                  <li>• European Accessibility Act (EAA) requirements</li>
                  <li>• Section 508 compliance (US)</li>
                  <li>• EN 301 549 accessibility standard</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            This Accessibility Statement is effective as of {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} and applies to all users of Veloryn.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            © {new Date().getFullYear()} Veloryn. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
