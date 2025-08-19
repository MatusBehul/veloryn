'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, TrendingUp, Brain, Shield, Users, Globe, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Veloryn</h1>
          <p className="text-xl text-gray-600">
            Advanced Financial Intelligence - Democratizing institutional-quality financial analysis through AI
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-8">
          <CardContent className="py-8">
            <div className="text-center mb-8">
              <TrendingUp className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                To make sophisticated financial analysis accessible to everyone by leveraging cutting-edge AI technology. 
                We believe that quality financial insights shouldn't be limited to large institutions - they should be 
                available to individual investors, small businesses, and anyone seeking to make informed financial decisions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What We Do */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <Brain className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600 text-sm">
                  Our multi-agent AI system processes vast amounts of financial data to provide comprehensive analysis 
                  that rivals traditional institutional research.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <TrendingUp className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Market Intelligence</h3>
                <p className="text-gray-600 text-sm">
                  Real-time market data, technical analysis, sentiment tracking, and risk assessment combined 
                  into actionable insights for better decision-making.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Shield className="h-8 w-8 text-red-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Risk Management</h3>
                <p className="text-gray-600 text-sm">
                  Advanced risk assessment tools and portfolio optimization strategies to help you understand 
                  and manage investment risks effectively.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Our Technology */}
        <Card className="mb-8">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Technology</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Multi-Agent AI System</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <Zap className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Specialized AI agents for data analysis, technical analysis, sentiment analysis, and risk assessment</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Real-time data processing from multiple financial data sources</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Machine learning models trained on institutional-grade datasets</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sources & Security</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Enterprise-grade security with encrypted data transmission and storage</span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>GDPR and data privacy compliance with transparent data handling</span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Integration with trusted financial data providers and market feeds</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Values */}
        <Card className="mb-8">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Accessibility</h3>
                <p className="text-gray-600 text-sm">
                  Making institutional-quality financial analysis available to everyone, regardless of their background or resources.
                </p>
              </div>
              <div className="text-center">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Transparency</h3>
                <p className="text-gray-600 text-sm">
                  Clear communication about our methodologies, limitations, and the educational nature of our analysis.
                </p>
              </div>
              <div className="text-center">
                <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600 text-sm">
                  Continuously advancing our AI capabilities to provide better insights and more comprehensive analysis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Started</h2>
          <p className="text-gray-600 mb-6">
            Ready to experience AI-powered financial analysis? Join thousands of users who trust Veloryn for their market insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg">
                Explore Features
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
