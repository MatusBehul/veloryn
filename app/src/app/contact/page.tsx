import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Mail, Phone, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about Veloryn? 
            We&apos;re here to help with your inquiries.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-gray-600">support@veloryn.com</p>
                  <p className="text-sm text-gray-500">We typically respond within 24 hours</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                  <p className="text-sm text-gray-500">Available Mon-Fri, 9AM-6PM EST</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Clock className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Business Hours</h3>
                  <p className="text-gray-600">
                    Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                    Saturday - Sunday: Closed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
