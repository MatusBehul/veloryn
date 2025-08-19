'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { stripe } from '@/lib/stripe';

export function useSubscription() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createCheckoutSession = async (priceId?: string) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.id}`,
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          priceId: priceId,
        }),
      });

      const { sessionId } = await response.json();
      const stripeInstance = await stripe;
      
      if (stripeInstance) {
        const { error } = await stripeInstance.redirectToCheckout({
          sessionId,
        });
        
        if (error) {
          console.error('Stripe checkout error:', error);
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPortalSession = async () => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    if (!user.customerId) {
      console.error('No customer ID found. Please contact support.');
      alert('Unable to access billing portal. Please contact support.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: user.customerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 503) {
          // Stripe portal not configured - redirect to custom page
          window.location.href = '/subscription';
          return;
        } else {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      alert('Unable to open billing portal. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const syncSubscription = async () => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      const response = await fetch('/api/sync-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync subscription: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Subscription synced:', data);
      
      // Force a refresh of user data by reloading the page
      // This ensures the AuthContext gets the updated subscription data
      window.location.reload();
      
      return data;
    } catch (error) {
      console.error('Error syncing subscription:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Consider active, trialing, and past_due as having access
  // past_due gives users a grace period to update payment
  const hasActiveSubscription = user?.subscriptionStatus && 
    ['active', 'trialing', 'past_due'].includes(user.subscriptionStatus);

  // Check specific tier access
  const hasStandardAccess = hasActiveSubscription && user?.subscriptionTier && 
    ['standard', 'premium', 'vip', 'ultimate'].includes(user.subscriptionTier);

  const hasPremiumAccess = hasActiveSubscription && user?.subscriptionTier && 
    ['premium', 'vip', 'ultimate'].includes(user.subscriptionTier);

  const hasVipAccess = hasActiveSubscription && user?.subscriptionTier && 
    ['vip', 'ultimate'].includes(user.subscriptionTier);

  const hasUltimateAccess = hasActiveSubscription && user?.subscriptionTier === 'ultimate';

  // Helper function to check minimum tier requirement
  const hasMinimumTier = (requiredTier: 'free' | 'standard' | 'premium' | 'vip' | 'ultimate') => {
    if (!user?.subscriptionTier) return requiredTier === 'free';
    
    const tierHierarchy = ['free', 'standard', 'premium', 'vip', 'ultimate'];
    const userTierIndex = tierHierarchy.indexOf(user.subscriptionTier);
    const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
    
    return userTierIndex >= requiredTierIndex && (requiredTier === 'free' || hasActiveSubscription);
  };

  return {
    createCheckoutSession,
    createPortalSession,
    syncSubscription,
    hasActiveSubscription,
    hasStandardAccess,
    hasPremiumAccess,
    hasVipAccess,
    hasUltimateAccess,
    hasMinimumTier,
    subscriptionTier: user?.subscriptionTier || 'free',
    loading,
    subscriptionStatus: user?.subscriptionStatus,
  };
}
