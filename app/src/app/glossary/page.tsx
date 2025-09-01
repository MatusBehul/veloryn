'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Search, 
  Book, 
  Filter, 
  ArrowUp, 
  ExternalLink,
  BookOpen,
  Target,
  TrendingUp,
  Brain,
  DollarSign,
  Shield,
  Building
} from 'lucide-react';
import { 
  GlossaryTerm, 
  GlossaryCategory, 
  GLOSSARY_TERMS, 
  GLOSSARY_CATEGORIES,
  searchTerms,
  getTermsByCategory 
} from '@/lib/glossary';

const categoryIcons: Record<GlossaryCategory, React.ReactNode> = {
  fundamental_analysis: <Target className="h-5 w-5" />,
  technical_indicators: <TrendingUp className="h-5 w-5" />,
  trading_psychology: <Brain className="h-5 w-5" />,
  general_finance: <DollarSign className="h-5 w-5" />,
  market_metrics: <BookOpen className="h-5 w-5" />,
  risk_management: <Shield className="h-5 w-5" />,
  corporate_finance: <Building className="h-5 w-5" />
};

export default function GlossaryPage() {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | 'all'>('all');
  const [filteredTerms, setFilteredTerms] = useState<GlossaryTerm[]>(GLOSSARY_TERMS);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  useEffect(() => {
    let terms = searchQuery ? searchTerms(searchQuery, language) : GLOSSARY_TERMS;
    
    if (selectedCategory !== 'all') {
      terms = terms.filter(term => term.category === selectedCategory);
    }
    
    setFilteredTerms(terms);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    // Handle anchor links (e.g., /glossary#pe_ratio)
    const hash = window.location.hash.slice(1);
    if (hash) {
      setExpandedTerm(hash);
      // Scroll to the term after a short delay
      setTimeout(() => {
        const element = document.getElementById(hash);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTermClick = (term: GlossaryTerm) => {
    setExpandedTerm(expandedTerm === term.id ? null : term.id);
    // Update URL without causing navigation
    window.history.replaceState(null, '', `#${term.id}`);
  };

  const handleCategoryFilter = (category: GlossaryCategory | 'all') => {
    setSelectedCategory(category);
    setExpandedTerm(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Book className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">{t('glossaryPageTitle')}</h1>
          </div>
          <p className="text-lg text-gray-600">
            {t('glossaryPageDescription')}
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder={t('glossaryPageSearchTipPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryFilter('all')}
                  className="flex items-center"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {t('glossaryPageAllCategories')} ({GLOSSARY_TERMS.length})
                </Button>
                {Object.entries(GLOSSARY_CATEGORIES).map(([key, category]) => {
                  const categoryKey = key as GlossaryCategory;
                  const count = getTermsByCategory(categoryKey).length;
                  return (
                    <Button
                      key={key}
                      variant={selectedCategory === categoryKey ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleCategoryFilter(categoryKey)}
                      className="flex items-center"
                    >
                      {categoryIcons[categoryKey]}
                      <span className="ml-2">{t(`glossary_cat_${categoryKey}_name`)} ({count})</span>
                    </Button>
                  );
                })}
              </div>

              {/* Results Summary */}
              <div className="text-sm text-gray-600">
                {searchQuery ? (
                  <span>{t('glossaryPageFound')} {filteredTerms.length} {t('glossaryPageTermsMatching')} "{searchQuery}"</span>
                ) : (
                  <span>{t('glossaryPageShowing')} {filteredTerms.length} {t('glossaryPageTerms')}</span>
                )}
                {selectedCategory !== 'all' && (
                  <span>{t('glossaryPageIn')} {t(`glossary_cat_${selectedCategory}_name`)}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms List */}
        <div className="space-y-4">
          {filteredTerms.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('glossaryPageNoTermsFound')}</h3>
                <p className="text-gray-600">
                  {t('glossaryPageNoTermsFoundSuggestion')}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTerms.map((term) => (
              <div key={term.id} id={term.id}>
                <Card 
                  className={`transition-all duration-200 ${
                    expandedTerm === term.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
                  }`}
                >
                <CardContent className="py-6">
                  <div className="space-y-4">
                    {/* Term Header */}
                    <div 
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => handleTermClick(term)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {categoryIcons[term.category]}
                          <h3 className="text-xl font-semibold text-gray-900">
                            {term.translations[language].term}
                          </h3>
                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {t(`glossary_cat_${term.category}_name` as any)}
                          </span>
                        </div>
                        
                        {term.translations[language].aliases && term.translations[language].aliases.length > 0 && (
                          <div className="mb-3">
                            <span className="text-sm text-gray-500">{t('glossaryPageAlsoKnownAs')}: </span>
                            <span className="text-sm text-gray-700">
                              {term.translations[language].aliases.join(', ')}
                            </span>
                          </div>
                        )}
                        
                        <p className="text-gray-700 leading-relaxed">
                          {term.translations[language].shortDefinition}
                        </p>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-4 flex-shrink-0"
                      >
                        {expandedTerm === term.id ? 'Less' : 'More'}
                      </Button>
                    </div>

                    {/* Expanded Content */}
                    {expandedTerm === term.id && (
                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        {/* Full Definition */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Detailed Definition</h4>
                          <p className="text-gray-700 leading-relaxed">
                            {term.translations[language].fullDefinition}
                          </p>
                        </div>

                        {/* Examples */}
                        {term.translations[language].examples && term.translations[language].examples.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Examples</h4>
                            <ul className="space-y-2">
                              {term.translations[language].examples.map((example, index) => (
                                <li key={index} className="text-gray-700 italic">
                                  • {example}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Tags */}
                        {term.tags && term.tags.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Related Topics</h4>
                            <div className="flex flex-wrap gap-2">
                              {term.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSearchQuery(tag);
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Related Terms */}
                        {term.relatedTerms && term.relatedTerms.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Related Terms</h4>
                            <div className="flex flex-wrap gap-2">
                              {term.relatedTerms.map((relatedId) => {
                                const relatedTerm = GLOSSARY_TERMS.find(t => t.id === relatedId);
                                if (!relatedTerm) return null;
                                
                                return (
                                  <button
                                    key={relatedId}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTermClick(relatedTerm);
                                      // Scroll to the related term
                                      setTimeout(() => {
                                        document.getElementById(relatedId)?.scrollIntoView({ 
                                          behavior: 'smooth' 
                                        });
                                      }, 100);
                                    }}
                                    className="inline-flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                                  >
                                    {relatedTerm.translations[language].term}
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              </div>
            ))
          )}
        </div>

        {/* Scroll to Top Button */}
        {filteredTerms.length > 5 && (
          <div className="fixed bottom-8 right-8">
            <Button
              onClick={scrollToTop}
              size="sm"
              className="rounded-full shadow-lg"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <BookOpen className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Educational Resource</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                This glossary is provided for educational purposes only. Financial terms and their applications can vary 
                in different contexts. Always consult with qualified financial professionals for investment advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
