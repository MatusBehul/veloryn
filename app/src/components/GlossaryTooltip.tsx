'use client';

import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { GlossaryTerm } from '@/lib/glossary';
import { useTranslation } from '@/hooks/useTranslation';

interface GlossaryTooltipProps {
  term: GlossaryTerm;
  children: React.ReactNode;
  onTermClick?: (term: GlossaryTerm) => void;
}

export const GlossaryTooltip: React.FC<GlossaryTooltipProps> = ({
  term,
  children,
  onTermClick,
}) => {
  const { t, language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
    onTermClick?.(term);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <span className="relative inline-block">
      <span
        className={`
          cursor-pointer border-b-2 border-dotted transition-all duration-200
          ${isHovered || isOpen 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-blue-300 hover:border-blue-400'
          }
        `}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={term.translations[language].shortDefinition}
      >
        {children}
      </span>

      {/* Tooltip on hover */}
      {isHovered && !isOpen && (
        <div className="absolute z-50 w-80 p-3 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">{term.translations[language].term}</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {term.translations[language].shortDefinition}
              </p>
              <div className="mt-2">
                <span className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                  {t('glossaryTooltipClickDefinition')} →
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded card on click */}
      {isOpen && (
        <div className="absolute z-50 w-96 p-4 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-gray-900 text-lg">{term.translations[language].term}</h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <h5 className="font-medium text-gray-700 mb-1">{t('glossaryTooltipDefinition')}</h5>
              <p className="text-sm text-gray-600 leading-relaxed">
                {term.translations[language].fullDefinition}
              </p>
            </div>

            {term.translations[language].examples && term.translations[language].examples.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-700 mb-1">{t('glossaryTooltipExample')}</h5>
                <p className="text-sm text-gray-600 italic">
                  {term.translations[language].examples[0]}
                </p>
              </div>
            )}

            {term.translations[language].aliases && term.translations[language].aliases.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-700 mb-1">{t('glossaryTooltipAlsoKnownAs')}</h5>
                <div className="flex flex-wrap gap-1">
                  {term.translations[language].aliases.map((alias, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {alias}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100">
              <a
                href={`/glossary#${term.id}`}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                onClick={(e) => e.stopPropagation()}
              >
                {t('glossaryTooltipViewInGlossary')}
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      )}
    </span>
  );
};

interface GlossaryHighlighterProps {
  text: string;
  enableTooltips?: boolean;
  language: string;
  onTermClick?: (term: GlossaryTerm) => void;
}

export const GlossaryHighlighter: React.FC<GlossaryHighlighterProps> = ({
  text,
  enableTooltips = true,
  language,
  onTermClick
}) => {
  const [detectedTerms, setDetectedTerms] = useState<{ term: GlossaryTerm; matches: RegExpMatchArray[] }[]>([]);

  React.useEffect(() => {
    import('@/lib/glossary').then(({ detectTermsInText }) => {
      const detected = detectTermsInText(text, language);
      setDetectedTerms(detected);
    });
  }, [text]);

  if (!enableTooltips) {
    return <>{text}</>;
  }

  if (detectedTerms.length === 0) {
    return <>{text}</>;
  }

  // Create a list of all matches with their positions
  const allMatches = detectedTerms.flatMap(({ term, matches }) =>
    matches.map(match => ({
      term,
      match,
      start: match.index!,
      end: match.index! + match[0].length,
      text: match[0]
    }))
  ).sort((a, b) => a.start - b.start);

  // Remove overlapping matches (keep the first one)
  const nonOverlappingMatches = [];
  let lastEnd = 0;
  
  for (const match of allMatches) {
    if (match.start >= lastEnd) {
      nonOverlappingMatches.push(match);
      lastEnd = match.end;
    }
  }

  if (nonOverlappingMatches.length === 0) {
    return <>{text}</>;
  }

  // Build the highlighted text
  const result = [];
  let currentIndex = 0;

  for (let i = 0; i < nonOverlappingMatches.length; i++) {
    const match = nonOverlappingMatches[i];

    // Add text before the match
    if (currentIndex < match.start) {
      result.push(text.slice(currentIndex, match.start));
    }

    // Add the highlighted term
    result.push(
      <GlossaryTooltip
        key={`${match.term.id}-${match.start}`}
        term={match.term}
        onTermClick={onTermClick}
      >
        {match.text}
      </GlossaryTooltip>
    );

    currentIndex = match.end;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    result.push(text.slice(currentIndex));
  }

  return <>{result}</>;
};
