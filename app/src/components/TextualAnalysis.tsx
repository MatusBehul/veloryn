'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAnalysisLanguage } from '@/hooks/useLanguage';
import { LanguageSelector } from './LanguageSelector';

interface TextualAnalysisProps {
  analysisData: any;
  ticker: string;
}

export function TextualAnalysis({ analysisData, ticker }: TextualAnalysisProps) {
  const { currentAnalysis, hasMultipleLanguages } = useAnalysisLanguage(analysisData);

  if (!currentAnalysis) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-gray-500 text-center">No analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  const sections = [
    {
      key: 'overall_analysis',
      title: 'Overall Analysis',
      icon: '📊',
      description: 'Comprehensive analysis overview'
    },
    {
      key: 'investment_narrative',
      title: 'Investment Narrative',
      icon: '💡',
      description: 'Investment story and thesis'
    },
    {
      key: 'fundamental_analysis',
      title: 'Fundamental Analysis',
      icon: '🔍',
      description: 'Financial fundamentals deep dive'
    },
    {
      key: 'technical_analysis',
      title: 'Technical Analysis',
      icon: '📈',
      description: 'Chart patterns and indicators'
    },
    {
      key: 'risk_analysis',
      title: 'Risk Analysis',
      icon: '⚠️',
      description: 'Risk factors and considerations'
    },
    {
      key: 'sentiment_analysis',
      title: 'Sentiment Analysis',
      icon: '😊',
      description: 'Market sentiment and outlook'
    },
    {
      key: 'investment_insights',
      title: 'Investment Insights',
      icon: '💎',
      description: 'Key insights and recommendations'
    }
  ];

  const renderAnalysisSection = (content: string[] | string) => {
    if (!content) return <p className="text-gray-500">No content available</p>;
    
    if (Array.isArray(content)) {
      return (
        <div className="space-y-4">
          {content.map((paragraph, index) => (
            <p key={index} className="text-gray-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      );
    }
    
    return <p className="text-gray-700 leading-relaxed">{content}</p>;
  };

  return (
    <div className="space-y-6">
      {/* Language Selector Header */}
      {hasMultipleLanguages && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Analysis Report</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Language:</span>
            <LanguageSelector variant="dropdown" showText={true} />
          </div>
        </div>
      )}

      {/* Analysis Sections */}
      {sections.map((section) => {
        const content = currentAnalysis[section.key];
        if (!content) return null;

        return (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">{section.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold">{section.title}</h3>
                  <p className="text-sm text-gray-600 font-normal">{section.description}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderAnalysisSection(content)}
            </CardContent>
          </Card>
        );
      })}

      {/* Summary Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800">
            This analysis for <strong>{ticker}</strong> includes multiple perspectives on the investment opportunity. 
            Each section provides valuable insights to help inform your investment decisions. Remember to consider 
            your risk tolerance and investment objectives.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
