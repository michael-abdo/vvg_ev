'use client';

import React, { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/calculators/shared/calculator-layout';
import { useCalculator } from '@/components/calculators/shared/use-calculator';
import { formatCurrency, formatPerMile, formatPercent } from '@/components/calculators/shared/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sliders, 
  TrendingUp, 
  TrendingDown, 
  Fuel, 
  Zap, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PresetScenario {
  name: string;
  description: string;
  dieselPrice: number;
  electricityPrice: number;
  milesPerYear: number;
  truckIncentive: number;
}

const presetScenarios: PresetScenario[] = [
  {
    name: 'Current Market',
    description: 'Average 2024 prices',
    dieselPrice: 4.23,
    electricityPrice: 0.40,
    milesPerYear: 70000,
    truckIncentive: 0
  },
  {
    name: 'High Fuel Prices',
    description: 'Diesel at $5.50/gal',
    dieselPrice: 5.50,
    electricityPrice: 0.40,
    milesPerYear: 70000,
    truckIncentive: 0
  },
  {
    name: 'With Incentives',
    description: '$150k BEV incentive',
    dieselPrice: 4.23,
    electricityPrice: 0.40,
    milesPerYear: 70000,
    truckIncentive: 150000
  },
  {
    name: 'High Mileage',
    description: '100k miles/year',
    dieselPrice: 4.23,
    electricityPrice: 0.40,
    milesPerYear: 100000,
    truckIncentive: 0
  }
];

export default function DashboardCalculator() {
  const {
    dieselInputs,
    bevInputs,
    enableLCFS,
    results,
    updateDieselInput,
    updateBEVInput,
    setEnableLCFS
  } = useCalculator();

  const [preparedFor, setPreparedFor] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('Current Market');

  // Calculate percentage savings
  const totalSavings = useMemo(() => {
    if (!results) return 0;
    return results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9];
  }, [results]);

  const savingsPercentage = useMemo(() => {
    if (!results) return 0;
    return totalSavings / results.diesel.yearlyTotalCosts[9];
  }, [results, totalSavings]);

  // Prepare pie chart data for cost breakdown
  const costBreakdownData = useMemo(() => {
    if (!results) return { diesel: [], bev: [] };
    
    const dieselBreakdown = [
      { name: 'Fuel', value: results.diesel.fuelCostPerMile * dieselInputs.milesPerYear * 10 },
      { name: 'Maintenance', value: dieselInputs.maintenancePerMile * dieselInputs.milesPerYear * 10 },
      { name: 'Upfront', value: results.diesel.netUpfrontCost }
    ];

    const bevBreakdown = [
      { name: 'Electricity', value: results.bev.fuelCostPerMile * bevInputs.milesPerYear * 10 },
      { name: 'Maintenance', value: bevInputs.maintenancePerMile * bevInputs.milesPerYear * 10 },
      { name: 'Upfront', value: results.bev.netUpfrontCost },
      ...(results.bev.lcfsRevenuePerYear ? [{ name: 'LCFS Revenue', value: -results.bev.lcfsRevenuePerYear * 10 }] : [])
    ];

    return { diesel: dieselBreakdown, bev: bevBreakdown };
  }, [results, dieselInputs, bevInputs]);

  // Apply preset scenario
  const applyScenario = (scenario: PresetScenario) => {
    updateDieselInput('fuelPrice', scenario.dieselPrice.toString());
    updateBEVInput('fuelPrice', scenario.electricityPrice.toString());
    updateDieselInput('milesPerYear', scenario.milesPerYear.toString());
    updateBEVInput('milesPerYear', scenario.milesPerYear.toString());
    updateBEVInput('truckIncentive', scenario.truckIncentive.toString());
    setSelectedScenario(scenario.name);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <CalculatorLayout
      title="Dynamic Cost Dashboard"
      description="Adjust parameters with sliders and see real-time cost comparisons"
      icon={<Sliders className="h-6 w-6" />}
      preparedFor={preparedFor}
      preparedBy={preparedBy}
      onPreparedForChange={setPreparedFor}
      onPreparedByChange={setPreparedBy}
    >
      <div className="grid gap-6">
        {/* Preset Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {presetScenarios.map((scenario) => (
                <Button
                  key={scenario.name}
                  variant={selectedScenario === scenario.name ? 'default' : 'outline'}
                  className="flex flex-col h-auto py-3"
                  onClick={() => applyScenario(scenario)}
                >
                  <span className="font-semibold">{scenario.name}</span>
                  <span className="text-xs mt-1 font-normal">{scenario.description}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Sliders */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Dynamic Inputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fuel Prices */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-red-500" />
                      Diesel Price ($/gal)
                    </Label>
                    <span className="text-sm font-semibold">${dieselInputs.fuelPrice}</span>
                  </div>
                  <Slider
                    value={[dieselInputs.fuelPrice]}
                    onValueChange={([value]) => updateDieselInput('fuelPrice', value.toString())}
                    min={2}
                    max={7}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      Electricity ($/kWh)
                    </Label>
                    <span className="text-sm font-semibold">${bevInputs.fuelPrice}</span>
                  </div>
                  <Slider
                    value={[bevInputs.fuelPrice]}
                    onValueChange={([value]) => updateBEVInput('fuelPrice', value.toString())}
                    min={0.05}
                    max={0.8}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Annual Mileage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Annual Mileage</Label>
                  <span className="text-sm font-semibold">{dieselInputs.milesPerYear.toLocaleString()} miles</span>
                </div>
                <Slider
                  value={[dieselInputs.milesPerYear]}
                  onValueChange={([value]) => {
                    updateDieselInput('milesPerYear', value.toString());
                    updateBEVInput('milesPerYear', value.toString());
                  }}
                  min={20000}
                  max={150000}
                  step={5000}
                  className="w-full"
                />
              </div>

              {/* Truck Costs */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Diesel Truck Cost</Label>
                    <span className="text-sm font-semibold">{formatCurrency(dieselInputs.truckCost)}</span>
                  </div>
                  <Slider
                    value={[dieselInputs.truckCost]}
                    onValueChange={([value]) => updateDieselInput('truckCost', value.toString())}
                    min={100000}
                    max={300000}
                    step={5000}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>BEV Truck Cost</Label>
                    <span className="text-sm font-semibold">{formatCurrency(bevInputs.truckCost)}</span>
                  </div>
                  <Slider
                    value={[bevInputs.truckCost]}
                    onValueChange={([value]) => updateBEVInput('truckCost', value.toString())}
                    min={300000}
                    max={800000}
                    step={10000}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Incentives */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    BEV Incentive
                  </Label>
                  <span className="text-sm font-semibold">{formatCurrency(bevInputs.truckIncentive)}</span>
                </div>
                <Slider
                  value={[bevInputs.truckIncentive]}
                  onValueChange={([value]) => updateBEVInput('truckIncentive', value.toString())}
                  min={0}
                  max={200000}
                  step={5000}
                  className="w-full"
                />
              </div>

              {/* LCFS Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enable-lcfs-dashboard"
                    checked={enableLCFS}
                    onChange={(e) => setEnableLCFS(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="enable-lcfs-dashboard">Enable LCFS Revenue (CA, WA, OR)</Label>
                </div>
                {enableLCFS && results && (
                  <Badge variant="secondary">
                    +{formatCurrency(results.bev.lcfsRevenuePerYear || 0)}/year
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Real-time Results */}
          <div className="space-y-4">
            <Card className={totalSavings > 0 ? 'border-green-500' : 'border-red-500'}>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">10-Year Savings</p>
                  <p className="text-3xl font-bold mt-2">
                    {formatCurrency(Math.abs(totalSavings))}
                  </p>
                  <div className="flex items-center justify-center mt-2">
                    {totalSavings > 0 ? (
                      <>
                        <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-green-600 font-medium">
                          {formatPercent(Math.abs(savingsPercentage))} savings
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-red-600 font-medium">
                          {formatPercent(Math.abs(savingsPercentage))} more expensive
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Operating Cost per Mile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600">Diesel</span>
                    <span className="font-semibold">
                      {results && formatPerMile(results.diesel.totalOperatingCostPerMile)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600">BEV</span>
                    <span className="font-semibold">
                      {results && formatPerMile(results.bev.totalOperatingCostPerMile)}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Savings</span>
                      <span className="font-semibold text-green-600">
                        {results && formatPerMile(
                          results.diesel.totalOperatingCostPerMile - results.bev.totalOperatingCostPerMile
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Break-even Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {results && (() => {
                  const breakEvenIndex = results.bev.yearlyTotalCosts.findIndex(
                    (cost: number, i: number) => cost < results.diesel.yearlyTotalCosts[i]
                  );
                  const breakEvenYear = breakEvenIndex === -1 ? null : breakEvenIndex + 1;
                  
                  return breakEvenYear ? (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">Year {breakEvenYear}</p>
                      <p className="text-sm text-gray-600 mt-1">BEV becomes cheaper</p>
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Break-even beyond 10 years with current parameters
                      </AlertDescription>
                    </Alert>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cost Breakdown Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Diesel Cost Breakdown (10 Years)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costBreakdownData.diesel}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {costBreakdownData.diesel.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">BEV Cost Breakdown (10 Years)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costBreakdownData.bev}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {costBreakdownData.bev.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}