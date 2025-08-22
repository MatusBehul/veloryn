'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { FavoriteTickersWidget } from '@/components/FavoriteTickersWidget';
import Link from 'next/link';
import { 
  BarChart3, 
  TrendingUp, 
  Star, 
  Settings, 
  Mail,
  User as UserIcon,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { hasActiveSubscription, loading, subscriptionTier } = useSubscription();
  const { t } = useTranslation();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <h2 className="text-xl font-semibold mb-4">{t('authRequired')}</h2>
            <p className="text-gray-600 mb-4">{t('authRequiredDesc')}</p>
            <Link href="/login">
              <Button>{t('goToLogin')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quickActions = [
    {
      title: t('browseAnalysis'),
      description: t('browseAnalysisDesc'),
      icon: BarChart3,
      href: '/analysis',
      color: 'bg-blue-500',
    },
    {
      title: t('favoriteTickers'),
      description: t('favoriteTickersDesc'),
      icon: Star,
      href: '/settings',
      color: 'bg-yellow-500',
    },
    {
      title: t('accountSettings'),
      description: t('accountSettingsDesc'),
      icon: Settings,
      href: '/subscription',
      color: 'bg-gray-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {t('welcomeBack')}{user.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-slate-600">
            {t('aiDashboardDesc')}
          </p>
        </div>

        {/* Account Status */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t('accountStatus')}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {loading ? (
                      <span className="text-gray-500">{t('checkingSubscription')}</span>
                    ) : hasActiveSubscription ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 font-medium">{t('membershipActive')}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-yellow-600 font-medium">{t('freeTier')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {!hasActiveSubscription && !loading && (
                <Link href="/pricing">
                  <Button>
                    {t('upgradeMember')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="py-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 ${action.color} rounded-lg`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                    <Link href={action.href}>
                      <Button variant="outline" size="sm" className="w-full">
                        {t('open')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity / Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Favorite Tickers Widget */}
          <FavoriteTickersWidget />

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('accountInformation')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('userEmail')}</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('subscription')}</span>
                  <span className={`font-medium ${subscriptionTier ? 'text-green-600' : 'text-gray-600'}`}>
                    {subscriptionTier?.toUpperCase() || 'FREE'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('favoriteTickers')}</span>
                  <span className="font-medium">
                    {user.favoriteTickers?.length || 0} {t('favoriteTickersCount')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle>{t('gettingStarted')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">1</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t('setupTickers')}</p>
                    <p className="text-sm text-gray-600">{t('setupTickersDesc')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">2</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t('browseAIAnalysis')}</p>
                    <p className="text-sm text-gray-600">{t('browseAIAnalysisDesc')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">3</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t('receiveDailyUpdates')}</p>
                    <p className="text-sm text-gray-600">{t('receiveDailyUpdatesDesc')}</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Link href="/settings">
                    <Button className="w-full">
                      <Star className="mr-2 h-4 w-4" />
                      {t('configureFavoriteTickers')}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
