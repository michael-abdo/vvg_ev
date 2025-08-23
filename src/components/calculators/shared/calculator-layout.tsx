'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator as CalculatorIcon } from 'lucide-react';

interface CalculatorLayoutProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  preparedFor?: string;
  preparedBy?: string;
  onPreparedForChange?: (value: string) => void;
  onPreparedByChange?: (value: string) => void;
}

export function CalculatorLayout({
  title,
  description,
  icon = <CalculatorIcon className="h-6 w-6" />,
  children,
  preparedFor,
  preparedBy,
  onPreparedForChange,
  onPreparedByChange
}: CalculatorLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {(onPreparedForChange || onPreparedByChange) && (
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {onPreparedForChange && (
                <div>
                  <label htmlFor="prepared-for" className="block text-sm font-medium mb-2">
                    Prepared for
                  </label>
                  <input
                    id="prepared-for"
                    type="text"
                    value={preparedFor || ''}
                    onChange={(e) => onPreparedForChange(e.target.value)}
                    placeholder="Company name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              {onPreparedByChange && (
                <div>
                  <label htmlFor="prepared-by" className="block text-sm font-medium mb-2">
                    Prepared by
                  </label>
                  <input
                    id="prepared-by"
                    type="text"
                    value={preparedBy || ''}
                    onChange={(e) => onPreparedByChange(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
      {children}
    </div>
  );
}