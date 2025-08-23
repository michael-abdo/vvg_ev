'use client';

import React, { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/calculators/shared/calculator-layout';
import { useCalculator } from '@/components/calculators/shared/use-calculator';
import { formatCurrency, formatPerMile } from '@/components/calculators/shared/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LineChart as LineChartIcon, Settings, TrendingUp, TrendingDown } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine
} from 'recharts';

interface ChartDataPoint {
  year: number;
  diesel: number;
  bev: number;
  difference: number;
  dieselOperating: number;
  bevOperating: number;
}

export default function LineGraphCalculator() {
  const {
    dieselInputs,
    bevInputs,
    lcfsInputs,
    enableLCFS,
    results,
    updateDieselInput,
    updateBEVInput,
    updateLCFSInput,
    setEnableLCFS,
    reset
  } = useCalculator();

  const [showSettings, setShowSettings] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'total' | 'operating'>('total');
  const [preparedFor, setPreparedFor] = useState('');
  const [preparedBy, setPreparedBy] = useState('');

  // Prepare chart data
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!results) return [];
    
    const data: ChartDataPoint[] = [];
    for (let i = 0; i < 10; i++) {
      data.push({
        year: i + 1,
        diesel: results.diesel.yearlyTotalCosts[i],
        bev: results.bev.yearlyTotalCosts[i],
        difference: results.diesel.yearlyTotalCosts[i] - results.bev.yearlyTotalCosts[i],
        dieselOperating: results.diesel.annualOperatingCost * (i + 1),
        bevOperating: results.bev.annualOperatingCost * (i + 1)
      });
    }
    return data;
  }, [results]);

  // Find break-even point
  const breakEvenYear = useMemo(() => {
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

  return (
    <CalculatorLayout
      title="Interactive Line Graph Comparison"
      description="Visualize the cumulative cost comparison over time with interactive charts"
      icon={<LineChartIcon className="h-6 w-6" />}
      preparedFor={preparedFor}
      preparedBy={preparedBy}
      onPreparedForChange={setPreparedFor}
      onPreparedByChange={setPreparedBy}
    >
      <div className="grid gap-6">
        {/* Quick Actions Bar */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex gap-2">
              <Button
                variant={selectedMetric === 'total' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric('total')}
              >
                Total Cost
              </Button>
              <Button
                variant={selectedMetric === 'operating' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric('operating')}
              >
                Operating Cost Only
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedMetric === 'total' ? 'Total Cost Comparison' : 'Operating Cost Comparison'}
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
                  {breakEvenYear && selectedMetric === 'total' && (
                    <ReferenceLine 
                      x={breakEvenYear} 
                      stroke="#10b981" 
                      strokeDasharray="5 5"
                      label="Break-even"
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey={selectedMetric === 'total' ? 'diesel' : 'dieselOperating'}
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="Diesel"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={selectedMetric === 'total' ? 'bev' : 'bevOperating'}
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

        {/* Savings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cumulative Savings with BEV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Area
                    type="monotone"
                    dataKey="difference"
                    fill={chartData[chartData.length - 1]?.difference > 0 ? "#10b981" : "#ef4444"}
                    fillOpacity={0.3}
                    stroke={chartData[chartData.length - 1]?.difference > 0 ? "#10b981" : "#ef4444"}
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">10-Year Savings</p>
                  <p className="text-2xl font-bold">
                    {results && formatCurrency(chartData[9]?.difference || 0)}
                  </p>
                </div>
                {chartData[9]?.difference > 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600">Break-even Year</p>
                <p className="text-2xl font-bold">
                  {breakEvenYear ? `Year ${breakEvenYear}` : 'Beyond 10 years'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600">Cost per Mile Savings</p>
                <p className="text-2xl font-bold">
                  {results && formatPerMile(
                    results.diesel.totalOperatingCostPerMile - results.bev.totalOperatingCostPerMile
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card>
            <CardHeader>
              <CardTitle>Calculator Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Diesel Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-red-600">Diesel Vehicle</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="diesel-truck-cost">Truck Cost</Label>
                      <Input
                        id="diesel-truck-cost"
                        type="number"
                        value={dieselInputs.truckCost}
                        onChange={(e) => updateDieselInput('truckCost', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="diesel-fuel-price">Fuel Price ($/gal)</Label>
                      <Input
                        id="diesel-fuel-price"
                        type="number"
                        step="0.01"
                        value={dieselInputs.fuelPrice}
                        onChange={(e) => updateDieselInput('fuelPrice', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="diesel-mpg">MPG</Label>
                      <Input
                        id="diesel-mpg"
                        type="number"
                        step="0.1"
                        value={dieselInputs.efficiency}
                        onChange={(e) => updateDieselInput('efficiency', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="diesel-miles">Miles per Year</Label>
                      <Input
                        id="diesel-miles"
                        type="number"
                        value={dieselInputs.milesPerYear}
                        onChange={(e) => updateDieselInput('milesPerYear', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* BEV Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-green-600">Battery Electric Vehicle</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bev-truck-cost">Truck Cost</Label>
                      <Input
                        id="bev-truck-cost"
                        type="number"
                        value={bevInputs.truckCost}
                        onChange={(e) => updateBEVInput('truckCost', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bev-elec-price">Electricity ($/kWh)</Label>
                      <Input
                        id="bev-elec-price"
                        type="number"
                        step="0.01"
                        value={bevInputs.fuelPrice}
                        onChange={(e) => updateBEVInput('fuelPrice', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bev-efficiency">kWh/mile</Label>
                      <Input
                        id="bev-efficiency"
                        type="number"
                        step="0.1"
                        value={bevInputs.efficiency}
                        onChange={(e) => updateBEVInput('efficiency', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bev-miles">Miles per Year</Label>
                      <Input
                        id="bev-miles"
                        type="number"
                        value={bevInputs.milesPerYear}
                        onChange={(e) => updateBEVInput('milesPerYear', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* LCFS Toggle */}
              <div className="mt-6 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enable-lcfs"
                  checked={enableLCFS}
                  onChange={(e) => setEnableLCFS(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="enable-lcfs">Enable LCFS calculations</Label>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </CalculatorLayout>
  );
}