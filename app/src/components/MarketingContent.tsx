'use client';

import { useState, useEffect } from 'react';
import { useIntegration } from '@/hooks/useIntegration';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sparkles, TrendingUp, Users, Star } from 'lucide-react';

interface MarketingContentProps {
  /** Show loading indicator */
  showLoading?: boolean;
}

export function MarketingContent({ showLoading = true }: MarketingContentProps) {
  const { executeIntegration, loading, error } = useIntegration();
  const { user, loading: authLoading } = useAuth();
  const [marketingData, setMarketingData] = useState<any>(null);
  const [hasExecuted, setHasExecuted] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading before executing integration
    if (!authLoading && !hasExecuted) {
      handleMarketingIntegration();
    }
  }, [authLoading, hasExecuted]);

  const handleMarketingIntegration = async () => {
    setHasExecuted(true);
    
    console.log('MarketingContent: Starting integration with user:', user?.email || 'anonymous');
    
    try {
      const result = await executeIntegration({
        audience: 'customer',
        origin: 'default',
        keyName: 'ckey'
      });

      if (result && result.data) {
        // Extract message and discount from the API response
        let extractedData = null;
        
        // Check if we have bp array with data
        if (result.data.bp && Array.isArray(result.data.bp) && result.data.bp.length > 0) {
          const blueprintData = result.data.bp[0].data;
          if (blueprintData) {
            extractedData = {
              message: blueprintData.message || null,
              discount: blueprintData.discount || null,
              // Store the full data for debugging
              fullData: blueprintData
            };
            console.log('Extracted marketing data:', extractedData);
          }
        }
        
        setMarketingData(extractedData);
        console.log('Marketing integration successful:', result);
      } else {
        console.log('Marketing integration failed, using default content');
      }
    } catch (err) {
      console.log('Marketing integration error, using default content:', err);
      // Continue with default content - don't block the UI
    }
  };

  // Default marketing content - shown while loading or if integration fails
  const defaultMarketingContent = {
    title: "Join 10,000+ Smart Investors",
    subtitle: "Get Professional-Grade Financial Analysis",
    features: [
      "AI-powered market analysis",
      "Real-time financial insights", 
      "Risk assessment tools",
      "Personalized recommendations"
    ],
    testimonial: {
      text: "Veloryn's AI analysis helped me identify market opportunities I would have missed.",
      author: "Sarah M., Portfolio Manager"
    },
    stats: [
      { label: "Active Users", value: "10K+" },
      { label: "Analyses Generated", value: "50K+" },
      { label: "Success Rate", value: "94%" }
    ]
  };

  // Use integration data if available, otherwise fall back to default
  const content = marketingData || defaultMarketingContent;

  // Convert discount to percentage if it exists and is a valid number
  const formatDiscount = (discount: any): string => {
    if (!discount) return '';
    
    const discountValue = parseFloat(discount);
    if (isNaN(discountValue)) return '';
    
    // Convert to percentage and format
    return `Save ${(discountValue * 100).toFixed(0)}% on your subscription!`;
  };

//   if (loading && showLoading) {
//     return (
//       <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
//             <p className="text-gray-600">Join our Smart Investors community!</p>
//           </div>
//         </div>
//       </section>
//     );
//   }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-blue-500 mr-2" />
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              {content.message || 'Join our Smart Investors community!'}
            </h2>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {formatDiscount(content.discount)}
          </p>
        </div>
      </div>
    </section>
  );
}
