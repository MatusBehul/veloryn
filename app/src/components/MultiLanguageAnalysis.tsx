'use client';

import React from 'react';
import { useAnalysisLanguage, useLanguage } from '@/hooks/useLanguage';
import { LanguageSelector } from './LanguageSelector';

interface MultiLanguageAnalysisProps {
  analysisData: any;
  ticker: string;
  className?: string;
}

export function MultiLanguageAnalysis({ analysisData, ticker, className = '' }: MultiLanguageAnalysisProps) {
  const { getTranslation } = useLanguage();
  const { currentAnalysis, hasMultipleLanguages } = useAnalysisLanguage(analysisData);

  if (!currentAnalysis) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">
          No analysis data available for {ticker}
        </p>
      </div>
    );
  }

  const renderAnalysisSection = (title: string, content: string[] | string) => {
    if (!content || (Array.isArray(content) && content.length === 0)) {
      return null;
    }

    const items = Array.isArray(content) ? content : [content];

    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header with language selector */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {ticker} Financial Analysis
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Current language: {currentAnalysis.language || 'en'}
          </p>
        </div>
        {hasMultipleLanguages && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {getTranslation('language')}:
            </span>
            <LanguageSelector variant="tabs" showText={false} />
          </div>
        )}
      </div>

      {/* Analysis content */}
      <div className="space-y-8">
        {renderAnalysisSection(
          getTranslation('overall_analysis'),
          currentAnalysis.overall_analysis
        )}

        {renderAnalysisSection(
          getTranslation('technical_analysis'),
          currentAnalysis.technical_analysis
        )}

        {renderAnalysisSection(
          getTranslation('fundamental_analysis'),
          currentAnalysis.fundamental_analysis
        )}

        {renderAnalysisSection(
          getTranslation('sentiment_analysis'),
          currentAnalysis.sentiment_analysis
        )}

        {renderAnalysisSection(
          getTranslation('risk_analysis'),
          currentAnalysis.risk_analysis
        )}

        {renderAnalysisSection(
          getTranslation('investment_insights'),
          currentAnalysis.investment_insights
        )}

        {renderAnalysisSection(
          getTranslation('investment_narrative'),
          currentAnalysis.investment_narrative
        )}
      </div>

      {/* Language info footer */}
      {hasMultipleLanguages && (
        <div className="mt-12 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Multi-language Analysis Available
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                This analysis is available in multiple languages. Use the language selector above to switch.
              </p>
            </div>
            <LanguageSelector variant="pills" className="ml-4" />
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for dashboard cards
export function MultiLanguageAnalysisCard({ analysisData, ticker, className = '' }: MultiLanguageAnalysisProps) {
  const { currentAnalysis, hasMultipleLanguages } = useAnalysisLanguage(analysisData);

  if (!currentAnalysis) {
    return null;
  }

  const summary = currentAnalysis.overall_analysis?.[0] || 
                  currentAnalysis.investment_insights?.[0] || 
                  'No summary available';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {ticker}
        </h3>
        {hasMultipleLanguages && (
          <LanguageSelector variant="pills" showText={false} className="ml-2" />
        )}
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
        {summary}
      </p>
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Language: {currentAnalysis.language || 'en'}
      </div>
    </div>
  );
}
