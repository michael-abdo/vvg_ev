'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCalculator } from '@/components/calculators/shared/use-calculator';
import { formatCurrency, formatPerMile, formatPercent } from '@/components/calculators/shared/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Truck,
  Zap,
  DollarSign,
  Leaf,
  TrendingUp,
  TrendingDown,
  Award,
  Calendar,
  CreditCard,
  Settings,
  LineChart as LineChartIcon,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { cn } from '@/lib/utils';
import { ExportButton } from '@/components/ui/export-button';
import {
  defaultLCFSInputs
} from '@/lib/calculators/bev-cost-calculator';

// HVIP Incentive tiers from Rizon calculator
const HVIP_INCENTIVES = {
  base: { amount: 60000, label: 'Base HVIP Voucher' },
  smallFleet: { amount: 120000, label: 'Small Fleet Eligible' },
  disadvantagedCommunity: { amount: 138000, label: 'Disadvantaged Community' }
};

// Vehicle data from Rizon calculator
const DIESEL_TRUCKS = [
  { id: 'isuzu-n-series', name: 'Isuzu N Series', cost: 65000, mpg: 8.5, maintenance: 0.50 },
  { id: 'hino-m5', name: 'Hino M5', cost: 72000, mpg: 7.8, maintenance: 0.55 },
  { id: 'freightliner-m2', name: 'Freightliner M2 Class 6', cost: 85000, mpg: 7.2, maintenance: 0.60 }
];

// Electric truck options with different battery configurations
const ELECTRIC_TRUCKS = [
  { id: 'rizon-standard', name: 'Rizon Electric - Standard Battery', cost: 185000, efficiency: 1.8, maintenance: 0.25 },
  { id: 'rizon-double', name: 'Rizon Electric - Double Battery', cost: 220000, efficiency: 1.8, maintenance: 0.25 },
  { id: 'rizon-extended', name: 'Rizon Electric - Extended Range', cost: 210000, efficiency: 1.6, maintenance: 0.25 }
];

interface ChartDataPoint {
  year: number;
  diesel: number;
  bev: number;
  difference: number;
}

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

export default function FinalCalculator() {
  const {
    dieselInputs,
    bevInputs,
    enableLCFS,
    results,
    updateDieselInput,
    updateBEVInput,
    setEnableLCFS
  } = useCalculator();

  // Local state for HVIP and vehicle selection
  const [selectedDieselTruck, setSelectedDieselTruck] = useState('isuzu-n-series');
  const [selectedElectricTruck, setSelectedElectricTruck] = useState('rizon-standard');
  const [hvipTier, setHvipTier] = useState<'base' | 'smallFleet' | 'disadvantagedCommunity'>('base');
  const [showInputs, setShowInputs] = useState(true);

  // Get selected truck and incentive data
  const selectedDiesel = DIESEL_TRUCKS.find(t => t.id === selectedDieselTruck) || DIESEL_TRUCKS[0];
  const selectedElectric = ELECTRIC_TRUCKS.find(t => t.id === selectedElectricTruck) || ELECTRIC_TRUCKS[0];
  const hvipIncentive = HVIP_INCENTIVES[hvipTier].amount;

  // Update calculator when vehicle selection changes
  useEffect(() => {
    updateDieselInput('truckCost', selectedDiesel.cost.toString());
    updateDieselInput('efficiency', selectedDiesel.mpg.toString());
    updateDieselInput('maintenancePerMile', selectedDiesel.maintenance.toString());
    
    updateBEVInput('truckCost', selectedElectric.cost.toString());
    updateBEVInput('efficiency', selectedElectric.efficiency.toString());
    updateBEVInput('maintenancePerMile', selectedElectric.maintenance.toString());
    updateBEVInput('truckIncentive', hvipIncentive.toString());
  }, [selectedDieselTruck, selectedElectricTruck, hvipTier, updateDieselInput, updateBEVInput, selectedDiesel, selectedElectric, hvipIncentive]);

  // Prepare chart data for line graph
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!results) return [];
    
    const data: ChartDataPoint[] = [];
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

  // Find break-even point for line chart
  const breakEvenIndex = useMemo(() => {
    const index = chartData.findIndex(point => point.difference > 0);
    return index === -1 ? null : index + 1;
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-semibold mb-2">Year {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
          <p className="text-sm mt-2 font-medium">
            Savings: {formatCurrency(payload[0]?.value - payload[1]?.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleExportPDF = async () => {
    if (!results) return;
    
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'final',
          dieselInputs,
          bevInputs,
          lcfsInputs: defaultLCFSInputs,
          enableLCFS
        }),
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'final-calculator-results.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('PDF export failed. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">

      {/* Section 1: Select Trucks (from HVIP) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-6 w-6" />
            Select Trucks to Compare
          </CardTitle>
          <CardDescription>
            Choose a diesel truck to compare against the Rizon electric truck
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Diesel Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Diesel Truck</h3>
              <Select value={selectedDieselTruck} onValueChange={setSelectedDieselTruck}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIESEL_TRUCKS.map(truck => (
                    <SelectItem key={truck.id} value={truck.id}>
                      {truck.name} - {formatCurrency(truck.cost)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Base Price</div>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(selectedDiesel.cost)}</div>
                <div className="text-sm text-gray-600 mt-2">{selectedDiesel.mpg} MPG</div>
              </div>
            </div>

            {/* Electric Truck */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Electric Truck
                <Zap className="h-5 w-5 text-green-500" />
              </h3>
              <Select value={selectedElectricTruck} onValueChange={setSelectedElectricTruck}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ELECTRIC_TRUCKS.map(truck => (
                    <SelectItem key={truck.id} value={truck.id}>
                      {truck.name} - {formatCurrency(truck.cost)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Base Price</div>
                <div className="text-2xl font-bold">{formatCurrency(selectedElectric.cost)}</div>
                <div className="text-sm text-gray-600 line-through">Before incentives</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(selectedElectric.cost - hvipIncentive)}
                </div>
                <div className="text-sm text-gray-600">After HVIP incentive</div>
                <div className="text-sm text-gray-600 mt-2">{selectedElectric.efficiency} kWh/mile</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: HVIP Selection (from HVIP) - Compact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5" />
            HVIP Incentive Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid md:grid-cols-3 gap-3 mb-3">
            {Object.entries(HVIP_INCENTIVES).map(([key, tier]) => (
              <label
                key={key}
                className={`relative flex cursor-pointer rounded-lg border p-3 ${
                  hvipTier === key ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  value={key}
                  checked={hvipTier === key}
                  onChange={(e) => setHvipTier(e.target.value as any)}
                />
                <div className="flex flex-1 flex-col">
                  <span className="block text-xs font-medium text-gray-900">
                    {tier.label}
                  </span>
                  <span className="mt-1 flex items-center text-xs text-gray-500">
                    {formatCurrency(tier.amount)}
                  </span>
                </div>
              </label>
            ))}
          </div>
          
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
            <a 
              href="https://webmaps.arb.ca.gov/PriorityPopulations/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline inline-flex items-center gap-1"
            >
              Check DAC eligibility <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>


      {/* Adjust Parameters (from Comparison Cards) */}
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
                    <Label>BEV Infrastructure Cost</Label>
                    <Input
                      type="number"
                      value={bevInputs.infrastructureCost}
                      onChange={(e) => updateBEVInput('infrastructureCost', e.target.value)}
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
                    id="enable-lcfs-final"
                    checked={enableLCFS}
                    onChange={(e) => setEnableLCFS(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="enable-lcfs-final">Enable LCFS calculations (CA, WA, OR)</Label>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Key Performance Indicators (from Comparison Cards) */}
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
          icon={<Leaf className="h-6 w-6" />}
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

      {/* Section 3: Comparison Cards (from Comparison Cards) */}
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
                <span className="text-sm text-gray-600">Cost per Mile</span>
                <span className="font-semibold">{results && formatPerMile(results.diesel.totalOperatingCostPerMile)}</span>
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
                <span className="text-sm text-gray-600">Cost per Mile</span>
                <span className="font-semibold">{results && formatPerMile(results.bev.totalOperatingCostPerMile)}</span>
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

      {/* Section 4: Total Cost Comparison Chart (from Line Graph) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5" />
            Total Cost Comparison Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="year" 
                  label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  label={{ value: 'Cost', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
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
                  strokeWidth={3}
                  name="Diesel"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="bev"
                  stroke="#22c55e"
                  strokeWidth={3}
                  name="BEV"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Export PDF Button at Bottom */}
      <div className="flex justify-center pt-6">
        <ExportButton onClick={handleExportPDF} className="px-8 py-3 text-lg" />
      </div>

    </div>
  );
}// Trigger Heroku rebuild
