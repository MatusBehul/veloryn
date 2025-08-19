import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="space-x-4">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
          <Link href="/analysis">
            <Button variant="outline">Analysis</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
