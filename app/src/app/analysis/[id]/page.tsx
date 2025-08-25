'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, TrendingUp, AlertCircle, Download, Share, Mail, DollarSign, BarChart3, Activity, Target, Shield, Info, Building, Zap, Brain, PieChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ComposedChart, ReferenceLine } from 'recharts';

interface AnalysisData {
  id: string;
  ticker: string;
  date?: string;
  createdAt?: string;
  // Data collection documents
  analysis_overview?: {
    analysis_data?: Record<string, {
      fundamental_analysis?: string[];
      investment_narrative?: string[];
      investment_insights?: string[];
      overall_analysis?: string[];
      risk_analysis?: string[];
      sentiment_analysis?: string[];
      technical_analysis?: string[];
    }>;
  };
  balance_sheet_data?: any;
  company_overview?: any;
  daily_prices?: any;
  dividend_data?: any;
  earnings_estimates?: any;
  hourly_prices?: any;
  income_statement_data?: any;
  monthly_prices?: any;
  splits_data?: any;
  technical_analysis_results?: any;
  weekly_prices?: any;
  // Optional fields that might exist in Firestore documents
  timestamp?: any;
  created_at?: any;
}

export default function AnalysisDetailPage() {
  const { id } = useParams();
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const { hasActiveSubscription } = useSubscription();
  const { t } = useTranslation();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [priceChartData, setPriceChartData] = useState<any[]>([]);
  const [monthlyChartData, setMonthlyChartData] = useState<any[]>([]);
  const [financialChartData, setFinancialChartData] = useState<any[]>([]);

  const formatDate = (dateString: any) => {
    if (!dateString) return 'Date not available';
    
    // Handle string dates
    if (typeof dateString === 'string') {
      // Handle YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      // Handle ISO string or other formats
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    
    // Handle Firestore Timestamp objects
    if (typeof dateString === 'object' && dateString !== null && '_seconds' in dateString) {
      const timestamp = dateString as { _seconds: number; _nanoseconds: number };
      return new Date(timestamp._seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    
    return 'N/A';
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(numValue);
  };

  const formatLargeNumber = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return t('analysisNotAvailable');
    if (numValue >= 1e12) return `$${(numValue / 1e12).toFixed(2)}T`;
    if (numValue >= 1e9) return `$${(numValue / 1e9).toFixed(2)}B`;
    if (numValue >= 1e6) return `$${(numValue / 1e6).toFixed(2)}M`;
    if (numValue >= 1e3) return `$${(numValue / 1e3).toFixed(2)}K`;
    return formatCurrency(numValue);
  };

  const formatPercent = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return t('analysisNotAvailable');
    return `${numValue.toFixed(2)}%`;
  };

  // Helper function to format text with bold markdown
  const formatTextWithBold = (text: any): any => {
    if (!text || typeof text !== 'string') return text;
    return text.split('**').map((part, index) => 
      index % 2 === 1 ? <strong key={index}>{part}</strong> : part
    );
  };

  // Helper function to render analysis text sections
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

  // Helper function to render a single item (string or object)
  const renderSingleItem = (item: any) => {
    if (!item) return null;

    if (typeof item === 'string') {
      return (
        <p className="text-gray-700 leading-relaxed">
          {formatTextWithBold(item)}
        </p>
      );
    }

    if (typeof item === 'object') {
      return (
        <div className="bg-gray-50 p-4 rounded-lg border">
          {Object.entries(item).map(([key, value]) => (
            <div key={key} className="mb-2 last:mb-0">
              <span className="font-semibold text-gray-900">{key}: </span>
              <span className="text-gray-700">
                {typeof value === 'string' ? formatTextWithBold(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <p className="text-gray-700 leading-relaxed">
        {String(item)}
      </p>
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${analysis?.ticker} Financial Analysis`,
          text: 'Comprehensive AI-generated financial analysis',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (!analysis) return;
    
    const content = `
${analysis.ticker} Financial Analysis
Generated on: ${formatDate(analysis.date || analysis.timestamp || analysis.created_at || analysis.createdAt)}

${JSON.stringify(analysis, null, 2)}

---
Generated by Veloryn
Educational use only - Not financial advice
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.ticker}_analysis_${analysis.date || analysis.timestamp || new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEmailSend = async () => {
    if (!analysis || !firebaseUser || !id) return;

    try {
      setEmailLoading(true);
      const token = await firebaseUser.getIdToken();
      
      const response = await fetch('/api/email/send-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          analysisId: id,
          ticker: analysis.ticker,
          recipientEmail: user?.email || firebaseUser.email || '',
        })
      });

      if (response.ok) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 5000);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const fetchAnalysis = useCallback(async () => {
    if (!id || !firebaseUser) return;

    try {
      setLoading(true);
      setError('');

      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/financial-analysis/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analysis');
      }

      const data = await response.json();
      setAnalysis(data);

      // Process price data for chart
      if (data.daily_prices?.data) {
        const chartData = data.daily_prices.data
          .map((price: any) => ({
            date: new Date(price.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            price: price.close
          }))
          .reverse(); // Flip to chronological order (oldest to newest)
        setPriceChartData(chartData);
      }

      // Process monthly price data for long-term chart
      if (data.monthly_prices?.data) {
        const monthlyData = data.monthly_prices.data
          .map((price: any) => ({
            date: new Date(price.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
            price: price.close
          }))
          .reverse(); // Flip to chronological order (oldest to newest)
        setMonthlyChartData(monthlyData);
      }

      // Process financial data for chart
      if (data.income_statement_data?.data) {
        const financialData = data.income_statement_data.data
          .slice(0, 4)
          .reverse()
          .map((statement: any) => ({
            quarter: new Date(statement.fiscalDateEnding).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
            revenue: parseFloat(statement.totalRevenue) / 1e9,
            netIncome: parseFloat(statement.netIncome) / 1e9
          }));
        setFinancialChartData(financialData);
      }

    } catch (error) {
      console.error('Error fetching analysis:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [id, firebaseUser]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analysis</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/analysis">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analysis List
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">{t('analysisDetailNotFound')}</h1>
          <p className="text-gray-600 mb-4">{t('analysisDetailNotFoundDescription')}</p>
          <Link href="/analysis">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('analysisDetailBackToList')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/analysis">
            <Button variant="outline" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('analysisDetailBackToList')}
            </Button>
          </Link>
        </div>

        {/* Analysis Header */}
        <Card className="mb-8">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {analysis.ticker} {t('analysisDetailFinancialAnalysis')}
                </h1>
                <div className="flex items-center text-gray-600 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(analysis.date || analysis.timestamp || analysis.created_at || analysis.createdAt)}</span>
                  </div>
                  {analysis.company_overview?.data?.[0] && (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      <span>{analysis.company_overview.data[0].Name}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share className="h-4 w-4 mr-2" />
                  {t('analysisDetailShare')}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('analysisDetailDownload')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEmailSend}
                  disabled={emailLoading}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {emailLoading ? t('analysisDetailSending') : t('analysisDetailEmail')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Message */}
        {emailSent && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-5 w-5 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-green-800">
                  {t('analysisDetailEmailSuccess')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 1. Overall Analysis - First Section */}
        {analysis?.analysis_overview?.analysis_data?.[user?.preferredLanguage || 'en']?.overall_analysis && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                {t('analysisDetailOverallAnalysis')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {renderAnalysisSection(analysis.analysis_overview.analysis_data?.[user?.preferredLanguage || 'en']?.overall_analysis)}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 2. Price Performance - Two Columns */}
        {priceChartData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                {t('analysisDetailPricePerformance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Line Charts - Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Short Horizon */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">{t('analysisDetailShortTermPerformance')}</h4>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={priceChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            dot={{ fill: '#3B82F6' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Long Horizon */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">{t('analysisDetailLongTermPerformance')}</h4>
                    {monthlyChartData.length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={monthlyChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey="price" 
                              stroke="#10B981" 
                              strokeWidth={2}
                              dot={{ fill: '#10B981' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {analysis.company_overview?.data?.[0] && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h5 className="font-medium text-gray-900 mb-2">{t('analysisDetail52WeekHigh')}</h5>
                                <p className="text-xl font-bold text-blue-600">
                                  {formatCurrency(analysis.company_overview.data[0]._52WeekHigh)}
                                </p>
                              </div>
                              <div className="bg-red-50 p-4 rounded-lg">
                                <h5 className="font-medium text-gray-900 mb-2">{t('analysisDetail52WeekLow')}</h5>
                                <p className="text-xl font-bold text-red-600">
                                  {formatCurrency(analysis.company_overview.data[0]._52WeekLow)}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-green-50 p-4 rounded-lg">
                                <h5 className="font-medium text-gray-900 mb-2">{t('analysisDetail50DayMA')}</h5>
                                <p className="text-xl font-bold text-green-600">
                                  {formatCurrency(analysis.company_overview.data[0]._50DayMovingAverage)}
                                </p>
                              </div>
                              <div className="bg-purple-50 p-4 rounded-lg">
                                <h5 className="font-medium text-gray-900 mb-2">{t('analysisDetail200DayMA')}</h5>
                                <p className="text-xl font-bold text-purple-600">
                                  {formatCurrency(analysis.company_overview.data[0]._200DayMovingAverage)}
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3. Investment Narrative */}
        {analysis?.analysis_overview?.analysis_data?.[user?.preferredLanguage || 'en']?.investment_narrative && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                {t('analysisDetailInvestmentNarrative')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="prose max-w-none">
                  {renderAnalysisSection(analysis.analysis_overview.analysis_data?.[user?.preferredLanguage || 'en']?.investment_narrative)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 4. Technical Analysis Text */}
        {analysis?.analysis_overview?.analysis_data?.[user?.preferredLanguage || 'en']?.technical_analysis && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                {t('analysisDetailTechnicalAnalysis')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {renderAnalysisSection(analysis.analysis_overview.analysis_data?.[user?.preferredLanguage || 'en']?.technical_analysis)}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 5. Technical Indicators */}
        {analysis.technical_analysis_results && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                {t('analysisDetailTechnicalIndicators')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Helper function to get trend indicator */}
              {(() => {
                const timeframes = [
                  { key: 'hourly', label: t('analysisDetailHourly'), bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
                  { key: 'daily', label: t('analysisDetailDaily'), bgColor: 'bg-green-50', textColor: 'text-green-600' },
                  { key: 'weekly', label: t('analysisDetailWeekly'), bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
                  { key: 'monthly', label: t('analysisDetailMonthly'), bgColor: 'bg-orange-50', textColor: 'text-orange-600' }
                ];

                const indicators = [
                  { key: 'rsi', label: 'RSI', format: (val: number) => val?.toFixed(2) || 'N/A' },
                  { key: 'macd', label: 'MACD', format: (val: any) => val?.macd_line?.toFixed(2) || 'N/A' },
                  { key: 'sar', label: 'SAR', format: (val: number) => formatCurrency(val) },
                  { key: 'cci', label: 'CCI', format: (val: number) => val?.toFixed(2) || 'N/A' },
                  { key: 'obv', label: 'OBV', format: (val: number) => formatLargeNumber(val) },
                  { key: 'momentum', label: 'Momentum', format: (val: number) => val?.toFixed(2) || 'N/A' }
                ];

                return (
                  <div className="space-y-8">
                    {/* Key Indicators Comparison Table */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">{t('analysisDetailKeyIndicators')}</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                                {t('analysisDetailIndicator')}
                              </th>
                              {timeframes.map(timeframe => (
                                <th key={timeframe.key} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                                  {timeframe.label}
                                </th>
                              ))}
                              {/* <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trend
                              </th> */}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {indicators.map(indicator => (
                              <tr key={indicator.key} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r">
                                  {indicator.label}
                                </td>
                                {timeframes.map(timeframe => {
                                  const data = analysis.technical_analysis_results[timeframe.key];
                                  const value = data?.[indicator.key];
                                  return (
                                    <td key={timeframe.key} className={`px-4 py-3 text-sm text-center border-r ${timeframe.textColor}`}>
                                      <div className={`inline-block px-3 py-1 rounded-lg ${timeframe.bgColor}`}>
                                        {indicator.format(value)}
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Moving Averages Comparison */}
                    {(analysis.technical_analysis_results.daily?.moving_averages || 
                      analysis.technical_analysis_results.weekly?.moving_averages || 
                      analysis.technical_analysis_results.monthly?.moving_averages) && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">{t('analysisDetailMovingAverages')}</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                                  {t('analysisDetailMovingAverage')}
                                </th>
                                {timeframes.map(timeframe => (
                                  <th key={timeframe.key} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                                    {timeframe.label}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {['sma_20', 'sma_50', 'ema_12', 'ema_26'].map(ma => (
                                <tr key={ma} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r">
                                    {ma.toUpperCase().replace('_', ' ')}
                                  </td>
                                  {timeframes.map(timeframe => {
                                    const data = analysis.technical_analysis_results[timeframe.key]?.moving_averages;
                                    const value = data?.[ma];
                                    return (
                                      <td key={timeframe.key} className={`px-4 py-3 text-sm text-center border-r ${timeframe.textColor}`}>
                                        <div className={`inline-block px-3 py-1 rounded-lg ${timeframe.bgColor}`}>
                                          {formatCurrency(value)}
                                        </div>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Bollinger Bands Comparison */}
                    {(analysis.technical_analysis_results.daily?.bollinger_bands || 
                      analysis.technical_analysis_results.weekly?.bollinger_bands || 
                      analysis.technical_analysis_results.monthly?.bollinger_bands) && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">{t('analysisDetailBollingerBands')}</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                                  {t('analysisDetailBand')}
                                </th>
                                {timeframes.map(timeframe => (
                                  <th key={timeframe.key} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                                    {timeframe.label}
                                  </th>
                                ))}
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {t('analysisDetailBandWidth')}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {['upper', 'middle', 'lower'].map(band => (
                                <tr key={band} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r">
                                    {band === 'upper' ? t('analysisDetailUpperBand') : 
                                     band === 'middle' ? t('analysisDetailMiddleBand') : 
                                     t('analysisDetailLowerBand')}
                                  </td>
                                  {timeframes.map(timeframe => {
                                    const data = analysis.technical_analysis_results[timeframe.key]?.bollinger_bands;
                                    const value = data?.[band];
                                    return (
                                      <td key={timeframe.key} className={`px-4 py-3 text-sm text-center border-r ${timeframe.textColor}`}>
                                        <div className={`inline-block px-3 py-1 rounded-lg ${timeframe.bgColor}`}>
                                          {formatCurrency(value)}
                                        </div>
                                      </td>
                                    );
                                  })}
                                  <td className="px-4 py-3 text-sm text-center">
                                    {band === 'middle' && (() => {
                                      const daily = analysis.technical_analysis_results.daily?.bollinger_bands;
                                      if (daily?.upper && daily?.lower) {
                                        const width = ((daily.upper - daily.lower) / daily.middle * 100).toFixed(1);
                                        return `${width}%`;
                                      }
                                      return 'N/A';
                                    })()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Summary Cards for Quick Overview */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">{t('analysisDetailTechnicalSummary')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {timeframes.map(timeframe => {
                          const data = analysis.technical_analysis_results[timeframe.key];
                          if (!data) return null;
                          
                          // Get current price for comparison
                          const currentPrice = analysis.hourly_prices?.data?.[0]?.close || 
                                             analysis.daily_prices?.data?.[0]?.close || 0;
                          
                          return (
                            <div key={timeframe.key} className={`${timeframe.bgColor} p-4 rounded-lg border`}>
                              <h5 className={`font-medium ${timeframe.textColor} mb-3`}>{timeframe.label} {t('analysisDetailSignals')}</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">RSI:</span>
                                  <span className={`font-medium ${
                                    data.rsi > 70 ? 'text-red-600' : 
                                    data.rsi < 30 ? 'text-green-600' : 
                                    'text-gray-700'
                                  }`}>
                                    {data.rsi?.toFixed(1) || 'N/A'}
                                    {data.rsi > 70 ? ' ⚠️' : data.rsi < 30 ? ' 🚀' : ''}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">MACD:</span>
                                  <span className={`font-medium ${
                                    data.macd?.macd_line > data.macd?.signal_line ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {data.macd?.macd_line > data.macd?.signal_line ? 'Bullish 📈' : 'Bearish 📉'}
                                  </span>
                                </div>
                                {data.bollinger_bands && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">BB Position:</span>
                                    <span className={`font-medium ${
                                      currentPrice > data.bollinger_bands.upper ? 'text-red-600' :
                                      currentPrice < data.bollinger_bands.lower ? 'text-green-600' :
                                      'text-gray-700'
                                    }`}>
                                      {(() => {
                                        if (currentPrice > data.bollinger_bands.upper) return 'Above 🔥';
                                        if (currentPrice < data.bollinger_bands.lower) return 'Below 💎';
                                        return 'Within ⚖️';
                                      })()}
                                    </span>
                                  </div>
                                )}
                                {data.moving_averages && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Price vs SMA20:</span>
                                    <span className={`font-medium ${
                                      currentPrice > data.moving_averages.sma_20 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {currentPrice > data.moving_averages.sma_20 ? 'Above 📈' : 'Below 📉'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* 6. Fundamental Analysis Text */}
        {analysis?.analysis_overview?.analysis_data?.[user?.preferredLanguage || 'en']?.fundamental_analysis && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                {t('analysisDetailFundamentalAnalysis')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {renderAnalysisSection(analysis.analysis_overview.analysis_data?.[user?.preferredLanguage || 'en']?.fundamental_analysis)}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 7. Fundamental Analysis Charts */}
        {(analysis.income_statement_data?.data || analysis.balance_sheet_data?.data || analysis.company_overview?.data?.[0]) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                {t('analysisDetailFinancialDataCharts')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Company Overview Metrics */}
              {analysis.company_overview?.data?.[0] && (
                <div className="mb-8">
                  <h4 className="font-medium text-gray-900 mb-4">{t('analysisDetailKeyFinancialMetrics')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Market Cap</h5>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatLargeNumber(analysis.company_overview.data[0].MarketCapitalization)}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">P/E Ratio</h5>
                      <p className="text-2xl font-bold text-green-600">
                        {analysis.company_overview.data[0].PERatio || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">EPS</h5>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(analysis.company_overview.data[0].EPS)}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Dividend Yield</h5>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatPercent(analysis.company_overview.data[0].DividendYield * 100)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Performance Chart */}
              {financialChartData.length > 0 && (
                <div className="mb-8">
                  <h4 className="font-medium text-gray-900 mb-4">{t('analysisDetailFinancialPerformanceTrends')}</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={financialChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quarter" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}B`, '']} />
                        <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" />
                        <Bar dataKey="netIncome" name="Net Income" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Latest Quarter Financials */}
              {analysis.income_statement_data?.data?.[0] && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">{t('analysisDetailLatestQuarterFinancials')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">{t('analysisDetailTotalRevenue')}</h5>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatLargeNumber(analysis.income_statement_data.data[0].totalRevenue)}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">{t('analysisDetailNetIncome')}</h5>
                      <p className="text-2xl font-bold text-green-600">
                        {formatLargeNumber(analysis.income_statement_data.data[0].netIncome)}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">{t('analysisDetailGrossProfit')}</h5>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatLargeNumber(analysis.income_statement_data.data[0].grossProfit)}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">{t('analysisDetailOperatingIncome')}</h5>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatLargeNumber(analysis.income_statement_data.data[0].operatingIncome)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Balance Sheet Highlights */}
              {analysis.balance_sheet_data?.data?.[0] && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">{t('analysisDetailBalanceSheetHighlights')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">{t('analysisDetailTotalAssets')}</h5>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatLargeNumber(analysis.balance_sheet_data.data[0].totalAssets)}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">{t('analysisDetailTotalLiabilities')}</h5>
                      <p className="text-2xl font-bold text-red-600">
                        {formatLargeNumber(analysis.balance_sheet_data.data[0].totalLiabilities)}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">{t('analysisDetailShareholderEquity')}</h5>
                      <p className="text-2xl font-bold text-green-600">
                        {formatLargeNumber(analysis.balance_sheet_data.data[0].totalShareholderEquity)}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">{t('analysisDetailCashAndEquivalents')}</h5>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatLargeNumber(analysis.balance_sheet_data.data[0].cashAndCashEquivalentsAtCarryingValue)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 8. Risk Analysis */}
        {analysis?.analysis_overview?.analysis_data?.[user?.preferredLanguage || 'en']?.risk_analysis && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                {t('analysisDetailRiskAnalysis')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 p-6 rounded-lg">
                <div className="prose max-w-none">
                  {renderAnalysisSection(analysis.analysis_overview.analysis_data?.[user?.preferredLanguage || 'en']?.risk_analysis)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 9. Earnings and Other Visualizable Data */}
        {analysis.earnings_estimates?.data && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                {t('analysisDetailEarningsEstimates')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('analysisDetailEarningsPeriod')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('analysisDetailEpsEstimate')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('analysisDetailEpsHighLow')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('analysisDetailRevenueEstimate')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analysis.earnings_estimates.data.slice(0, 4).map((estimate: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {estimate.horizon}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(estimate.eps_estimate_average)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(estimate.eps_estimate_high)} / {formatCurrency(estimate.eps_estimate_low)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatLargeNumber(estimate.revenue_estimate_average)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dividend Information */}
        {/* {analysis.dividend_data?.data && analysis.dividend_data.data.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                {t('analysisDetailDividendInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {analysis.dividend_data.data.slice(0, 4).map((dividend: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">{t('analysisDetailExDividendDate')}</h5>
                    <p className="text-sm text-gray-600 mb-1">
                      {dividend.ex_dividend_date ? new Date(dividend.ex_dividend_date).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(dividend.open)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* 10. Sentiment Analysis */}
        {analysis?.analysis_overview?.analysis_data?.[user?.preferredLanguage || 'en']?.sentiment_analysis && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                {t('analysisDetailSentimentAnalysis')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <div className="prose max-w-none">
                  {renderAnalysisSection(analysis.analysis_overview.analysis_data?.[user?.preferredLanguage || 'en']?.sentiment_analysis)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 11. Investment Insights - Last Section */}
        {analysis?.analysis_overview?.analysis_data?.[user?.preferredLanguage || 'en']?.investment_insights && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                {t('analysisDetailInvestmentInsights')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="prose max-w-none">
                  {renderAnalysisSection(analysis.analysis_overview.analysis_data?.[user?.preferredLanguage || 'en']?.investment_insights)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            {/* <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" /> */}
            <div>
              <h3 className="text-sm font-medium text-red-800">{t('shared_red_page_disclaimer_title')}</h3>
              <p className="mt-1 text-sm text-red-700">
                {t('shared_red_page_disclaimer_text')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
