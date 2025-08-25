'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button';
import { VelorynLogo } from '@/components/VelorynLogo';
import { LanguageSelector } from '@/components/LanguageSelector';
import { User, LogOut, CreditCard, Crown, Plus, Menu, X } from 'lucide-react';

export function Header() {
  const { user } = useAuth();
  const { hasActiveSubscription, createPortalSession, createCheckoutSession, loading, subscriptionTier } = useSubscription();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const auth = getFirebaseAuth();
      if (auth) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleManageSubscription = async () => {
    try {
      await createPortalSession();
    } catch (error) {
      console.error('Error opening billing portal:', error);
      // Fallback to custom subscription page
      window.location.href = '/subscription';
    }
  };

  const handleUpgrade = async () => {
    try {
      await createCheckoutSession();
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="sm:hidden">
              <VelorynLogo size="sm" />
            </div>
            <div className="hidden sm:block">
              <VelorynLogo size="md" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/pricing"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('pricing')}
                </Link>

                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('dashboard')}
                </Link>
                
                {hasActiveSubscription && (
                  <>
                    <Link
                      href="/analysis"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {t('analysis')}
                    </Link>
                    
                    <Link
                      href="/news"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {t('news')}
                    </Link>
                  </>
                )}

                <Link
                  href="/settings"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('settings')}
                </Link>
                
                {/* Membership Status & Actions */}
                <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
                  {hasActiveSubscription ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-md">
                        <Crown className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-green-700">{subscriptionTier.toUpperCase()}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleManageSubscription}
                        className="p-2"
                        title={t('manage_subscription')}
                        disabled={loading}
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Link href="/pricing">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>{t('upgrade')}</span>
                      </Button>
                    </Link>
                  )}
                  
                  {/* Language Selector */}
                  <LanguageSelector variant="dropdown" />
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 max-w-[120px] truncate">{user.email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="p-2"
                      title={t('logout')}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/pricing"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('pricing')}
                </Link>
                <Link
                  href="/news"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('news')}
                </Link>
                <Link
                  href="/contact"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('contact')}
                </Link>
                <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
                  <LanguageSelector variant="dropdown" />
                  <span className="text-sm text-gray-600 hidden 2xl:inline">{t('starting_at_price')}</span>
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      {t('login')}
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </nav>

          {/* Tablet Navigation (simplified desktop nav for medium screens) */}
          <nav className="hidden lg:flex xl:hidden items-center space-x-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-gray-900 px-2 py-2 rounded-md text-sm font-medium"
                >
                  {t('dashboard')}
                </Link>
                
                {hasActiveSubscription && (
                  <>
                    <Link
                      href="/analysis"
                      className="text-gray-700 hover:text-gray-900 px-2 py-2 rounded-md text-sm font-medium"
                    >
                      {t('analysis')}
                    </Link>
                    
                    <Link
                      href="/news"
                      className="text-gray-700 hover:text-gray-900 px-2 py-2 rounded-md text-sm font-medium"
                    >
                      {t('news')}
                    </Link>
                  </>
                )}
                
                {/* Simplified actions for tablet */}
                <div className="flex items-center space-x-2 border-l border-gray-200 pl-2">
                  {hasActiveSubscription ? (
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-md">
                        <Crown className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-medium text-green-700">{subscriptionTier.substr(0, 3).toUpperCase()}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleManageSubscription}
                        className="p-1"
                        title={t('manage_subscription')}
                        disabled={loading}
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Link href="/pricing">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex items-center space-x-1 px-2 py-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span className="text-xs">{t('upgrade')}</span>
                      </Button>
                    </Link>
                  )}
                  
                  <LanguageSelector variant="dropdown" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="p-1"
                    title={t('logout')}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/pricing"
                  className="text-gray-700 hover:text-gray-900 px-2 py-2 rounded-md text-sm font-medium"
                >
                  {t('pricing')}
                </Link>
                <Link
                  href="/news"
                  className="text-gray-700 hover:text-gray-900 px-2 py-2 rounded-md text-sm font-medium"
                >
                  {t('news')}
                </Link>
                <div className="flex items-center space-x-2 border-l border-gray-200 pl-2">
                  <LanguageSelector variant="dropdown" />
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="px-2 py-1 text-xs">
                      {t('login')}
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </nav>

          {/* Mobile menu button and essential items */}
          <div className="flex lg:hidden items-center space-x-1 sm:space-x-2">
            {/* Language selector for mobile */}
            <LanguageSelector variant="dropdown" />
            
            {/* Subscription status for authenticated users */}
            {user && hasActiveSubscription && (
              <div className="flex items-center space-x-1 px-1 sm:px-2 py-1 bg-green-50 rounded-md">
                <Crown className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-700 hidden xs:inline">{subscriptionTier.toUpperCase()}</span>
              </div>
            )}
            
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1 sm:p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-1 sm:px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  {/* User info */}
                  <div className="px-2 sm:px-3 py-2 border-b border-gray-200 mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 truncate">{user.email}</span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    className="block px-2 sm:px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('dashboard')}
                  </Link>

                  {hasActiveSubscription && (
                    <>
                      <Link
                        href="/analysis"
                        className="block px-2 sm:px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {t('analysis')}
                      </Link>

                      <Link
                        href="/news"
                        className="block px-2 sm:px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {t('news')}
                      </Link>
                    </>
                  )}

                  <Link
                    href="/settings"
                    className="block px-2 sm:px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('settings')}
                  </Link>

                  <Link
                    href="/pricing"
                    className="block px-2 sm:px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('pricing')}
                  </Link>

                  {/* Action buttons */}
                  <div className="px-2 sm:px-3 py-2 space-y-2 border-t border-gray-200 mt-2 pt-2">
                    {hasActiveSubscription ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleManageSubscription();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-2"
                        disabled={loading}
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>{t('manage_subscription')}</span>
                      </Button>
                    ) : (
                      <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full flex items-center justify-center space-x-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>{t('upgrade')}</span>
                        </Button>
                      </Link>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t('logout')}</span>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/pricing"
                    className="block px-2 sm:px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('pricing')}
                  </Link>
                  <Link
                    href="/news"
                    className="block px-2 sm:px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('news')}
                  </Link>
                  <Link
                    href="/contact"
                    className="block px-2 sm:px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('contact')}
                  </Link>
                  
                  {/* Login button */}
                  <div className="px-2 sm:px-3 py-2 border-t border-gray-200 mt-2 pt-2">
                    <div className="text-center text-sm text-gray-600 mb-2">{t('starting_at_price')}</div>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        {t('login')}
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
