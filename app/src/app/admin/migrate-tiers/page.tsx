'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function MigrateTiersPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runMigration = async () => {
    if (!user) {
      alert('You must be logged in to run this migration');
      return;
    }

    // Simple admin check - you might want to implement proper admin roles
    if (!user.email?.includes('admin') && !user.email?.includes('matusbehul')) {
      alert('This action requires admin privileges');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/migrate-tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);

      if (response.ok) {
        console.log('Migration completed successfully:', data);
      } else {
        console.error('Migration failed:', data);
      }
    } catch (error) {
      console.error('Error running migration:', error);
      setResult({ error: 'Failed to run migration', details: error });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Subscription Tier Migration
          </h1>
          
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">
                ⚠️ Important Notes
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• This will update all users' subscription tiers based on their current Stripe subscriptions</li>
                <li>• Make sure the tier mapping configuration is set up correctly in Firestore</li>
                <li>• This operation may take a few minutes for large user bases</li>
                <li>• Only run this migration when you're ready to fully switch to the new tier system</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Migration Process
              </h3>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Fetch all users with Stripe customer IDs</li>
                <li>2. Query Stripe for their current subscriptions</li>
                <li>3. Map Stripe price IDs to subscription tiers using the config document</li>
                <li>4. Update each user's subscriptionTier field in Firestore</li>
                <li>5. Set users without active subscriptions to 'free' tier</li>
              </ol>
            </div>

            <Button
              onClick={runMigration}
              disabled={loading}
              className="w-full"
              variant="primary"
            >
              {loading ? 'Running Migration...' : 'Run Tier Migration'}
            </Button>

            {result && (
              <div className="mt-6 bg-gray-50 rounded-md p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Migration Results
                </h3>
                <pre className="text-sm text-gray-800 overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
