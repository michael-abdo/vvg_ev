'use client';

import React, { useState } from 'react';
import { CalculatorLayout } from '@/components/calculators/shared/calculator-layout';
import { useCalculator } from '@/components/calculators/shared/use-calculator';
import { formatCurrency, formatPerMile, formatPercent } from '@/components/calculators/shared/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Info,
  Zap,
  Fuel,
  CheckCircle
} from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  icon?: React.ReactNode;
  helper?: string;
}

function InputField({ label, value, onChange, prefix, suffix, step = 1, icon, helper }: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <div className={cn(
        "relative rounded-md transition-all",
        isFocused && "ring-2 ring-blue-500 ring-offset-2"
      )}>
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          step={step}
          className={cn(
            "transition-all",
            prefix && "pl-8",
            suffix && "pr-12"
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            {suffix}
          </span>
        )}
      </div>
      {helper && (
        <p className="text-xs text-gray-500">{helper}</p>
      )}
    </div>
  );
}

function ResultMetric({ label, value, trend, icon, color = 'blue' }: {
  label: string;
  value: string;
  trend?: 'up' | 'down';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200'
  };

  return (
    <div className={cn("p-4 rounded-lg border transition-all hover:shadow-md", colorClasses[color])}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        {trend && (
          trend === 'up' ? 
            <TrendingUp className="h-4 w-4" /> : 
            <TrendingDown className="h-4 w-4" />
        )}
      </div>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xl font-bold">{value}</span>
      </div>
    </div>
  );
}

export default function InteractiveCalculator() {
  const {
    dieselInputs,
    bevInputs,
    enableLCFS,
    results,
    updateDieselInput,
    updateBEVInput,
    setEnableLCFS,
    reset
  } = useCalculator();

  const [preparedFor, setPreparedFor] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [activeSection, setActiveSection] = useState<'diesel' | 'bev'>('diesel');
  
  
  // Calculate metrics
  const totalSavings = results ? results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9] : 0;
  const savingsPercentage = results && results.diesel.yearlyTotalCosts[9] > 0
    ? totalSavings / results.diesel.yearlyTotalCosts[9]
    : 0;
  
  const breakEvenYear = results
    ? results.bev.yearlyTotalCosts.findIndex(
        (cost: number, i: number) => cost < results.diesel.yearlyTotalCosts[i]
      ) + 1
    : 0;

  const operatingSavingsPerMile = results
    ? results.diesel.totalOperatingCostPerMile - results.bev.totalOperatingCostPerMile
    : 0;


  // Prepare radial chart data
  const savingsChartData = [
    {
      name: 'Savings',
      value: Math.abs(savingsPercentage) * 100,
      fill: totalSavings > 0 ? '#10b981' : '#ef4444'
    }
  ];


  return (
    <CalculatorLayout
      title="Interactive BEV Calculator"
      description="Modern, real-time cost comparison with instant feedback"
      icon={<Calculator className="h-6 w-6" />}
      preparedFor={preparedFor}
      preparedBy={preparedBy}
      onPreparedForChange={setPreparedFor}
      onPreparedByChange={setPreparedBy}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Type Selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Button
                  variant={activeSection === 'diesel' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setActiveSection('diesel')}
                >
                  <Fuel className="h-4 w-4 mr-2" />
                  Diesel Vehicle
                </Button>
                <Button
                  variant={activeSection === 'bev' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setActiveSection('bev')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Electric Vehicle
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Input Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {activeSection === 'diesel' ? (
                  <>
                    <Fuel className="h-5 w-5 text-red-500" />
                    Diesel Vehicle Parameters
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 text-green-500" />
                    Electric Vehicle Parameters
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeSection === 'diesel' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Purchase Price"
                      value={dieselInputs.truckCost}
                      onChange={(v) => updateDieselInput('truckCost', v)}
                      prefix="$"
                      icon={<DollarSign className="h-4 w-4" />}
                    />
                    <InputField
                      label="Fuel Price"
                      value={dieselInputs.fuelPrice}
                      onChange={(v) => updateDieselInput('fuelPrice', v)}
                      prefix="$"
                      suffix="/gal"
                      step={0.01}
                      helper="Current market price"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Fuel Efficiency"
                      value={dieselInputs.efficiency}
                      onChange={(v) => updateDieselInput('efficiency', v)}
                      suffix="MPG"
                      step={0.1}
                    />
                    <InputField
                      label="Annual Mileage"
                      value={dieselInputs.milesPerYear}
                      onChange={(v) => {
                        updateDieselInput('milesPerYear', v);
                        updateBEVInput('milesPerYear', v);
                      }}
                      suffix="miles"
                      step={1000}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Maintenance Cost"
                      value={dieselInputs.maintenancePerMile}
                      onChange={(v) => updateDieselInput('maintenancePerMile', v)}
                      prefix="$"
                      suffix="/mile"
                      step={0.01}
                    />
                    <InputField
                      label="Residual Value"
                      value={dieselInputs.residualValue}
                      onChange={(v) => updateDieselInput('residualValue', v)}
                      prefix="$"
                      helper="Value after 10 years"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Purchase Price"
                      value={bevInputs.truckCost}
                      onChange={(v) => updateBEVInput('truckCost', v)}
                      prefix="$"
                      icon={<DollarSign className="h-4 w-4" />}
                    />
                    <InputField
                      label="Electricity Price"
                      value={bevInputs.fuelPrice}
                      onChange={(v) => updateBEVInput('fuelPrice', v)}
                      prefix="$"
                      suffix="/kWh"
                      step={0.01}
                      helper="Local utility rate"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Energy Efficiency"
                      value={bevInputs.efficiency}
                      onChange={(v) => updateBEVInput('efficiency', v)}
                      suffix="kWh/mi"
                      step={0.1}
                    />
                    <InputField
                      label="Truck Incentive"
                      value={bevInputs.truckIncentive}
                      onChange={(v) => updateBEVInput('truckIncentive', v)}
                      prefix="$"
                      helper="Federal/state rebates"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Maintenance Cost"
                      value={bevInputs.maintenancePerMile}
                      onChange={(v) => updateBEVInput('maintenancePerMile', v)}
                      prefix="$"
                      suffix="/mile"
                      step={0.01}
                    />
                    <InputField
                      label="Infrastructure Cost"
                      value={bevInputs.infrastructureCost}
                      onChange={(v) => updateBEVInput('infrastructureCost', v)}
                      prefix="$"
                      helper="Charging equipment"
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Low Carbon Fuel Standard (LCFS)
                      </Label>
                      <input
                        type="checkbox"
                        checked={enableLCFS}
                        onChange={(e) => setEnableLCFS(e.target.checked)}
                        className="h-4 w-4"
                      />
                    </div>
                    {enableLCFS && (
                      <div className="pl-6 text-sm text-gray-600">
                        Revenue: +{results && formatCurrency(results.bev.lcfsRevenuePerYear || 0)}/year
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Overall Savings */}
          <Card className={cn(
            "border-2 transition-all",
            totalSavings > 0 ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
          )}>
            <CardHeader>
              <CardTitle className="text-center">10-Year Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={savingsChartData}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={10} fill={totalSavings > 0 ? '#10b981' : '#ef4444'} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {formatPercent(Math.abs(savingsPercentage))}
                    </p>
                    <p className="text-sm text-gray-600">
                      {totalSavings > 0 ? 'Savings' : 'More Expensive'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-2xl font-bold">
                  {formatCurrency(Math.abs(totalSavings))}
                </p>
                <p className="text-sm text-gray-600">
                  {totalSavings > 0 ? 'Total Savings with BEV' : 'Additional Cost with BEV'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="space-y-3">
            <ResultMetric
              label="Break-even"
              value={breakEvenYear > 0 && breakEvenYear <= 10 ? `Year ${breakEvenYear}` : 'Beyond 10 years'}
              icon={<CheckCircle className="h-5 w-5" />}
              color={breakEvenYear <= 5 ? 'green' : breakEvenYear <= 10 ? 'orange' : 'red'}
            />
            
            <ResultMetric
              label="Per Mile Savings"
              value={formatPerMile(operatingSavingsPerMile)}
              trend={operatingSavingsPerMile > 0 ? 'up' : 'down'}
              color={operatingSavingsPerMile > 0 ? 'green' : 'red'}
            />
            
            <ResultMetric
              label="Diesel 10-Year Cost"
              value={results ? formatCurrency(results.diesel.yearlyTotalCosts[9]) : '$0'}
              icon={<Fuel className="h-5 w-5" />}
              color="red"
            />
            
            <ResultMetric
              label="BEV 10-Year Cost"
              value={results ? formatCurrency(results.bev.yearlyTotalCosts[9]) : '$0'}
              icon={<Zap className="h-5 w-5" />}
              color="green"
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={reset}
              >
                Reset to Defaults
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  const diesel = results?.diesel.yearlyTotalCosts[9] || 0;
                  const bev = results?.bev.yearlyTotalCosts[9] || 0;
                  const savings = diesel - bev;
                  alert(`
Summary Report
--------------
Diesel 10-Year Cost: ${formatCurrency(diesel)}
BEV 10-Year Cost: ${formatCurrency(bev)}
Total Savings: ${formatCurrency(Math.abs(savings))}
${savings > 0 ? 'Recommendation: BEV is more cost-effective' : 'Recommendation: Diesel is more cost-effective'}
                  `);
                }}
              >
                Generate Summary
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Badge variant={totalSavings > 0 ? "default" : "destructive"} className="text-sm py-1 px-3">
                {totalSavings > 0 ? 'BEV Recommended' : 'Diesel Recommended'}
              </Badge>
              <div className="text-sm text-gray-600">
                Based on {dieselInputs.milesPerYear.toLocaleString()} miles/year over 10 years
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span>
                Fuel savings: <strong className="text-green-600">
                  {formatCurrency(((results?.diesel.fuelCostPerMile || 0) - (results?.bev.fuelCostPerMile || 0)) * dieselInputs.milesPerYear)}
                </strong>/year
              </span>
              <span>
                LCFS revenue: <strong className="text-green-600">
                  {enableLCFS && results ? formatCurrency(results.bev.lcfsRevenuePerYear || 0) : '$0'}
                </strong>/year
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </CalculatorLayout>
  );
}