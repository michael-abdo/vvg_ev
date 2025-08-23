'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LineChart, 
  Sliders, 
  CreditCard, 
  BarChart3, 
  Calculator,
  Home
} from 'lucide-react';

const calculatorVariants = [
  {
    href: '/calculator/original',
    label: 'Original Calculator',
    icon: Calculator,
    description: 'Classic tabbed interface'
  },
  {
    href: '/calculator/line-graph',
    label: 'Line Graph Comparison',
    icon: LineChart,
    description: 'Interactive line chart visualization'
  },
  {
    href: '/calculator/dashboard',
    label: 'Dynamic Dashboard',
    icon: Sliders,
    description: 'Real-time sliders and adjustments'
  },
  {
    href: '/calculator/comparison-cards',
    label: 'Comparison Cards',
    icon: CreditCard,
    description: 'Side-by-side metric cards'
  },
  {
    href: '/calculator/stacked-chart',
    label: 'Cost Breakdown',
    icon: BarChart3,
    description: 'Stacked bar chart analysis'
  },
  {
    href: '/calculator/interactive',
    label: 'Interactive Calculator',
    icon: Calculator,
    description: 'Modern interactive interface'
  }
];

export function CalculatorNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/calculator" className="flex items-center gap-2 font-semibold text-lg">
            <Home className="h-5 w-5" />
            BEV Calculator Showcase
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            {calculatorVariants.map((variant) => {
              const Icon = variant.icon;
              const isActive = pathname === variant.href;
              
              return (
                <Link
                  key={variant.href}
                  href={variant.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  title={variant.description}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{variant.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="md:hidden overflow-x-auto pb-2">
          <div className="flex space-x-2">
            {calculatorVariants.map((variant) => {
              const Icon = variant.icon;
              const isActive = pathname === variant.href;
              
              return (
                <Link
                  key={variant.href}
                  href={variant.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap",
                    isActive 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {variant.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function CalculatorVariantGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {calculatorVariants.map((variant) => {
        const Icon = variant.icon;
        
        return (
          <Link
            key={variant.href}
            href={variant.href}
            className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  {variant.label}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {variant.description}
                </p>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        );
      })}
    </div>
  );
}