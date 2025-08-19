import React from 'react';
import Link from 'next/link';
import { VelorynLogo } from '@/components/VelorynLogo';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <VelorynLogo variant="light" size="lg" />
            </div>
            <p className="text-slate-300 mb-4">
              Advanced financial intelligence powered by AI. 
              Educational and research purposes only.
            </p>
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-slate-400">
                <strong>⚠️ Important Disclaimer:</strong> This system provides AI-generated analysis for 
                educational and informational purposes only. All output is NOT financial advice, 
                NOT offers to buy or sell securities, and NOT guaranteed for accuracy or profitability.
              </p>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-slate-300 hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-300 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-300 hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Financial Advisory Intelligence System. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Built with institutional standards for educational purposes.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
