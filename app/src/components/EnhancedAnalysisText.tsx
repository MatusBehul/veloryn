'use client';

import React from 'react';
import { GlossaryHighlighter } from '@/components/GlossaryTooltip';
import { useGlossary } from '@/hooks/useGlossary';
import { GlossaryTerm } from '@/lib/glossary';

interface EnhancedAnalysisTextProps {
  content: any;
  className?: string;
  language: string;
}

export const EnhancedAnalysisText: React.FC<EnhancedAnalysisTextProps> = ({
  content,
  className = '',
  language = 'en'
}) => {
  const { markTermAsViewed } = useGlossary();

  // Helper function to format text with bold markdown
  const formatTextWithBold = (text: any): any => {
    if (!text || typeof text !== 'string') return text;
    return text.split('**').map((part, index) => 
      index % 2 === 1 ? <strong key={index}>{part}</strong> : part
    );
  };

  // Handle term clicks for tracking
  const handleTermClick = (term: GlossaryTerm) => {
    markTermAsViewed(term.id);
  };

  // Helper function to render analysis text sections with glossary
  const renderAnalysisSection = (content: any) => {
    if (!content) return null;
    
    if (Array.isArray(content)) {
      return content.map((item: any, index: number) => (
        <div key={index} className="mb-4">
          {renderSingleItem(item)}
        </div>
      ));
    } else {
      return renderSingleItem(content);
    }
  };

  // Helper function to render a single item (string or object) with glossary
  const renderSingleItem = (item: any) => {
    if (!item) return null;

    if (typeof item === 'string') {
      return (
        <div className={`text-gray-700 leading-relaxed ${className}`}>
          <GlossaryHighlighter
            text={item}
            enableTooltips={true}
            language={language}
            onTermClick={handleTermClick}
          />
        </div>
      );
    }

    if (typeof item === 'object') {
      return (
        <div className="bg-gray-50 p-4 rounded-lg border">
          {Object.entries(item).map(([key, value]) => (
            <div key={key} className="mb-2 last:mb-0">
              <span className="font-semibold text-gray-900">{key}: </span>
              <span className="text-gray-700">
                {typeof value === 'string' ? (
                  <GlossaryHighlighter
                    text={value}
                    enableTooltips={true}
                    language={language}
                    onTermClick={handleTermClick}
                  />
                ) : (
                  String(value)
                )}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={`text-gray-700 leading-relaxed ${className}`}>
        <GlossaryHighlighter
          text={String(item)}
          enableTooltips={true}
          language={language}
          onTermClick={handleTermClick}
        />
      </div>
    );
  };

  return (
    <div>
      {renderAnalysisSection(content)}
    </div>
  );
};
