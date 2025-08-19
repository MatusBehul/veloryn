'use client';

import React from 'react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/Button';
import { VelorynLogo } from '@/components/VelorynLogo';
import { User, LogOut, CreditCard, Crown, Plus } from 'lucide-react';

export function Header() {
  const { user } = useAuth();
  const { hasActiveSubscription, createPortalSession, createCheckoutSession, loading, subscriptionTier } = useSubscription();

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <VelorynLogo size="md" />
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/pricing"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Pricing
                </Link>

                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                
                {hasActiveSubscription && (
                  <Link
                    href="/analysis"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Analysis
                  </Link>
                )}

                <Link
                  href="/settings"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Settings
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
                        title="Manage Subscription"
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
                        <span>Upgrade</span>
                      </Button>
                    </Link>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{user.email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="p-2"
                      title="Sign Out"
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
                  Pricing
                </Link>
                <Link
                  href="/contact"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Contact
                </Link>
                <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
                  <span className="text-sm text-gray-600">Starting at €2/month</span>
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
