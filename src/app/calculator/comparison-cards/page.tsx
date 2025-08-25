'use client';

import React, { useState } from 'react';
import { CalculatorLayout } from '@/components/calculators/shared/calculator-layout';
import { useCalculator } from '@/components/calculators/shared/use-calculator';
import { formatCurrency, formatPerMile, formatPercent } from '@/components/calculators/shared/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  CreditCard, 
  DollarSign, 
  Fuel, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Award,
  Calendar,
  Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'red' | 'green' | 'blue' | 'orange';
  progress?: number;
}

function MetricCard({ title, value, subtitle, icon, trend, color = 'blue', progress }: MetricCardProps) {
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
    <Card className={cn('relative overflow-hidden', colorClasses[color])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {progress !== undefined && (
              <Progress value={progress} className="mt-3 h-2" />
            )}
          </div>
          <div className={cn('p-3 rounded-lg bg-white/50', iconColorClasses[color])}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className="absolute top-4 right-4">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ComparisonCardsCalculator() {
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
  const [showInputs, setShowInputs] = useState(false);

  // Calculate various metrics
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

  return (
    <CalculatorLayout
      title="Side-by-Side Comparison Cards"
      description="Clear visual comparison of key metrics between Diesel and BEV"
      icon={<CreditCard className="h-6 w-6" />}
      preparedFor={preparedFor}
      preparedBy={preparedBy}
      onPreparedForChange={setPreparedFor}
      onPreparedByChange={setPreparedBy}
    >
      <div className="space-y-6">
        {/* Action Bar */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Badge variant={totalSavings > 0 ? "default" : "destructive"} className="text-sm">
                {totalSavings > 0 ? 'BEV Saves Money' : 'Diesel is Cheaper'}
              </Badge>
              <span className="text-sm text-gray-600">
                Based on 10-year total cost of ownership
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInputs(!showInputs)}
            >
              {showInputs ? 'Hide' : 'Show'} Inputs
            </Button>
          </CardContent>
        </Card>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="10-Year Savings"
            value={formatCurrency(Math.abs(totalSavings))}
            subtitle={totalSavings > 0 ? 'BEV saves' : 'Diesel saves'}
            icon={<DollarSign className="h-6 w-6" />}
            color={totalSavings > 0 ? 'green' : 'red'}
            trend={totalSavings > 0 ? 'up' : 'down'}
          />
          
          <MetricCard
            title="Break-even Point"
            value={breakEvenYear > 0 && breakEvenYear <= 10 ? `Year ${breakEvenYear}` : 'Beyond 10 years'}
            subtitle="When BEV becomes cheaper"
            icon={<Calendar className="h-6 w-6" />}
            color="blue"
          />
          
          <MetricCard
            title="Fuel Savings"
            value={formatCurrency(fuelSavingsPerYear)}
            subtitle="Annual fuel cost savings"
            icon={<Fuel className="h-6 w-6" />}
            color="green"
            trend="up"
          />
          
          <MetricCard
            title="Savings Rate"
            value={formatPercent(Math.abs(savingsPercentage))}
            subtitle={totalSavings > 0 ? 'Lower total cost' : 'Higher total cost'}
            icon={<Award className="h-6 w-6" />}
            color={totalSavings > 0 ? 'green' : 'orange'}
            progress={Math.abs(savingsPercentage) * 100}
          />
        </div>

        {/* Detailed Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Diesel Card */}
          <Card className="border-2 border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-red-700">
                  <Truck className="h-5 w-5" />
                  Diesel Vehicle
                </span>
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  Traditional
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Purchase Price</span>
                  <span className="font-semibold">{formatCurrency(dieselInputs.truckCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Net Upfront Cost</span>
                  <span className="font-semibold">{results && formatCurrency(results.diesel.netUpfrontCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Fuel Efficiency</span>
                  <span className="font-semibold">{dieselInputs.efficiency} MPG</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Fuel Cost</span>
                  <span className="font-semibold">${dieselInputs.fuelPrice}/gal</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Cost per Mile</span>
                  <span className="font-semibold">{results && formatPerMile(results.diesel.totalOperatingCostPerMile)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Annual Operating Cost</span>
                  <span className="font-semibold">{results && formatCurrency(results.diesel.annualOperatingCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-red-50 p-3 rounded-lg">
                  <span className="font-medium">10-Year Total Cost</span>
                  <span className="font-bold text-lg">{results && formatCurrency(results.diesel.yearlyTotalCosts[9])}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BEV Card */}
          <Card className="border-2 border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-green-700">
                  <Zap className="h-5 w-5" />
                  Battery Electric Vehicle
                </span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Zero Emission
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Purchase Price</span>
                  <span className="font-semibold">{formatCurrency(bevInputs.truckCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Net Upfront Cost</span>
                  <span className="font-semibold">{results && formatCurrency(results.bev.netUpfrontCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Energy Efficiency</span>
                  <span className="font-semibold">{bevInputs.efficiency} kWh/mi</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Electricity Cost</span>
                  <span className="font-semibold">${bevInputs.fuelPrice}/kWh</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Cost per Mile</span>
                  <span className="font-semibold">{results && formatPerMile(results.bev.totalOperatingCostPerMile)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Annual Operating Cost</span>
                  <span className="font-semibold">{results && formatCurrency(results.bev.annualOperatingCost)}</span>
                </div>
                {results?.bev.lcfsRevenuePerYear && (
                  <div className="flex justify-between items-center py-2 border-b text-green-600">
                    <span className="text-sm">LCFS Revenue</span>
                    <span className="font-semibold">+{formatCurrency(results.bev.lcfsRevenuePerYear)}/year</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 bg-green-50 p-3 rounded-lg">
                  <span className="font-medium">10-Year Total Cost</span>
                  <span className="font-bold text-lg">{results && formatCurrency(results.bev.yearlyTotalCosts[9])}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Input Controls */}
        {showInputs && (
          <Card>
            <CardHeader>
              <CardTitle>Adjust Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="costs">Costs</TabsTrigger>
                  <TabsTrigger value="incentives">Incentives</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Annual Mileage</Label>
                      <Input
                        type="number"
                        value={dieselInputs.milesPerYear}
                        onChange={(e) => {
                          updateDieselInput('milesPerYear', e.target.value);
                          updateBEVInput('milesPerYear', e.target.value);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Diesel Price ($/gal)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={dieselInputs.fuelPrice}
                        onChange={(e) => updateDieselInput('fuelPrice', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Electricity Price ($/kWh)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={bevInputs.fuelPrice}
                        onChange={(e) => updateBEVInput('fuelPrice', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Diesel Efficiency (MPG)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={dieselInputs.efficiency}
                        onChange={(e) => updateDieselInput('efficiency', e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="costs" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Diesel Truck Cost</Label>
                      <Input
                        type="number"
                        value={dieselInputs.truckCost}
                        onChange={(e) => updateDieselInput('truckCost', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>BEV Truck Cost</Label>
                      <Input
                        type="number"
                        value={bevInputs.truckCost}
                        onChange={(e) => updateBEVInput('truckCost', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Diesel Maintenance ($/mi)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={dieselInputs.maintenancePerMile}
                        onChange={(e) => updateDieselInput('maintenancePerMile', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>BEV Maintenance ($/mi)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={bevInputs.maintenancePerMile}
                        onChange={(e) => updateBEVInput('maintenancePerMile', e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="incentives" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>BEV Truck Incentive</Label>
                      <Input
                        type="number"
                        value={bevInputs.truckIncentive}
                        onChange={(e) => updateBEVInput('truckIncentive', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>BEV Infrastructure Incentive</Label>
                      <Input
                        type="number"
                        value={bevInputs.infrastructureIncentive}
                        onChange={(e) => updateBEVInput('infrastructureIncentive', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enable-lcfs-cards"
                      checked={enableLCFS}
                      onChange={(e) => setEnableLCFS(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="enable-lcfs-cards">Enable LCFS calculations (CA, WA, OR)</Label>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </CalculatorLayout>
  );
}