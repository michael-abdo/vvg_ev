'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPerMile, formatPercent } from '@/components/calculators/shared/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Leaf, 
  Award,
  Truck,
  Zap,
  Download
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  iconName: 'dollar' | 'calendar' | 'leaf' | 'award';
  trend?: 'up' | 'down' | 'neutral';
  color?: 'red' | 'green' | 'blue' | 'orange';
  progress?: number;
}

// Function to render icons based on name
const renderIcon = (iconName: string, className?: string) => {
  switch (iconName) {
    case 'dollar':
      return <DollarSign className={className || "h-4 w-4"} />;
    case 'calendar':
      return <Calendar className={className || "h-4 w-4"} />;
    case 'leaf':
      return <Leaf className={className || "h-4 w-4"} />;
    case 'award':
      return <Award className={className || "h-4 w-4"} />;
    default:
      return <DollarSign className={className || "h-4 w-4"} />; // Return fallback icon instead of null
  }
};

function MetricCard({ title, value, subtitle, iconName, trend, color = 'blue', progress }: MetricCardProps) {
  const colorClasses = {
    red: 'text-red-600 bg-red-50 border-red-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200'
  };

  const iconColorClasses = {
    red: 'text-red-500',
    green: 'text-green-500',
    blue: 'text-blue-500',
    orange: 'text-orange-500'
  };

  return (
    <Card className={`relative overflow-hidden ${colorClasses[color]}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600">{title}</p>
            <p className="text-xl font-bold mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
            {progress !== undefined && (
              <Progress value={progress} className="mt-2 h-1" />
            )}
          </div>
          <div className={`p-2 rounded-lg bg-white/50 ${iconColorClasses[color]}`}>
            {renderIcon(iconName)}
          </div>
        </div>
        {trend && (
          <div className="absolute top-3 right-3">
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-3 w-3 text-red-500" />
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ResultsSectionProps {
  results: any;
  dieselInputs: any;
  bevInputs: any;
  enableLCFS: boolean;
  selectedDieselTruck: string;
  selectedElectricTruck: string;
  selectedHvipTier: string;
}

export default function ResultsSection({
  results,
  dieselInputs,
  bevInputs,
  enableLCFS,
  selectedDieselTruck,
  selectedElectricTruck,
  selectedHvipTier
}: ResultsSectionProps) {

  // Calculate key metrics
  const totalSavings = results ? results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9] : 0;
  const savingsPercentage = results && results.diesel.yearlyTotalCosts[9] > 0
    ? totalSavings / results.diesel.yearlyTotalCosts[9]
    : 0;
  
  const breakEvenYear = results
    ? results.bev.yearlyTotalCosts.findIndex(
        (cost: number, i: number) => cost < results.diesel.yearlyTotalCosts[i]
      ) + 1
    : 0;

  const fuelSavingsPerYear = results
    ? (results.diesel.fuelCostPerMile - results.bev.fuelCostPerMile) * dieselInputs.milesPerYear
    : 0;

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!results) return [];
    
    const data = [];
    for (let i = 0; i < 10; i++) {
      data.push({
        year: i + 1,
        diesel: results.diesel.yearlyTotalCosts[i],
        bev: results.bev.yearlyTotalCosts[i],
        difference: results.diesel.yearlyTotalCosts[i] - results.bev.yearlyTotalCosts[i]
      });
    }
    return data;
  }, [results]);

  const breakEvenIndex = useMemo(() => {
    const index = chartData.findIndex(point => point.difference > 0);
    return index === -1 ? null : index + 1;
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
          <p className="font-semibold mb-1">Year {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
          <p className="text-xs mt-1 font-medium">
            Savings: {formatCurrency(payload[0]?.value - payload[1]?.value)}
          </p>
        </div>
      );
    }
    return <div />; // Return empty div instead of null
  };

  const handleExportPDF = async () => {
    if (!results) return;
    
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'final-v2',
          dieselInputs,
          bevInputs,
          enableLCFS,
          selectedDieselTruck,
          selectedElectricTruck,
          selectedHvipTier
        }),
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bev-calculator-results-v2.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('PDF export failed. Please try again.');
    }
  };

  if (!results) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Complete the vehicle selection to see results...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="10-Year Savings"
          value={formatCurrency(Math.abs(totalSavings))}
          subtitle={totalSavings > 0 ? 'BEV saves' : 'Diesel costs less'}
          iconName="dollar"
          color={totalSavings > 0 ? 'green' : 'red'}
          trend={totalSavings > 0 ? 'up' : 'down'}
        />
        
        <MetricCard
          title="Break-even"
          value={breakEvenYear > 0 && breakEvenYear <= 10 ? `Year ${breakEvenYear}` : '10+ years'}
          subtitle="When BEV becomes cheaper"
          iconName="calendar"
          color="blue"
        />
        
        <MetricCard
          title="Annual Fuel Savings"
          value={formatCurrency(fuelSavingsPerYear)}
          subtitle="Energy cost difference"
          iconName="leaf"
          color="green"
          trend="up"
        />
        
        <MetricCard
          title="Savings Rate"
          value={formatPercent(Math.abs(savingsPercentage))}
          subtitle={totalSavings > 0 ? 'Lower total cost' : 'Higher total cost'}
          iconName="award"
          color={totalSavings > 0 ? 'green' : 'orange'}
          progress={Math.abs(savingsPercentage) * 100}
        />
      </div>

      {/* Cost Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Diesel Summary */}
        <Card className="border-red-200">
          <CardHeader className="bg-red-50 pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-red-700">
                <Truck className="h-4 w-4" />
                Diesel Vehicle (10 Years)
              </span>
              <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                Traditional
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Purchase Price</span>
                <span className="font-semibold">{formatCurrency(dieselInputs.truckCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fuel Efficiency</span>
                <span>{dieselInputs.efficiency} MPG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cost per Mile</span>
                <span>{formatPerMile(results.diesel.totalOperatingCostPerMile)}</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-red-50 px-3 rounded font-medium border-t">
                <span>Total Cost (10 years)</span>
                <span className="text-lg">{formatCurrency(results.diesel.yearlyTotalCosts[9])}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BEV Summary */}
        <Card className="border-green-200">
          <CardHeader className="bg-green-50 pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-green-700">
                <Zap className="h-4 w-4" />
                Electric Vehicle (10 Years)
              </span>
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                Zero Emission
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Purchase Price</span>
                <span className="font-semibold">{formatCurrency(bevInputs.truckCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Energy Efficiency</span>
                <span>{bevInputs.efficiency} kWh/mi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cost per Mile</span>
                <span>{formatPerMile(results.bev.totalOperatingCostPerMile)}</span>
              </div>
              {results?.bev.lcfsRevenuePerYear && (
                <div className="flex justify-between text-green-600">
                  <span className="text-xs">LCFS Revenue</span>
                  <span className="font-semibold text-xs">+{formatCurrency(results.bev.lcfsRevenuePerYear)}/year</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded font-medium border-t">
                <span>Total Cost (10 years)</span>
                <span className="text-lg">{formatCurrency(results.bev.yearlyTotalCosts[9])}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Comparison Chart */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">10-Year Cost Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  label={{ value: 'Total Cost', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                {breakEvenIndex && (
                  <ReferenceLine 
                    x={breakEvenIndex} 
                    stroke="#10b981" 
                    strokeDasharray="5 5"
                    label="Break-even"
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="diesel"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Diesel"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="bev"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="BEV"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Export Section */}
      <div className="flex justify-center pt-4">
        <Button onClick={handleExportPDF} className="px-6 py-2">
          <Download className="h-4 w-4 mr-2" />
          Export to PDF
        </Button>
      </div>
      
    </div>
  );
}