'use client';

import React, { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/calculators/shared/calculator-layout';
import { useCalculator } from '@/components/calculators/shared/use-calculator';
import { formatCurrency, formatPerMile } from '@/components/calculators/shared/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  Info, 
  Layers,
  Settings
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Line
} from 'recharts';

interface CostCategory {
  name: string;
  diesel: number;
  bev: number;
  color: string;
}

export default function StackedChartCalculator() {
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
  const [selectedView, setSelectedView] = useState<'yearly' | 'category' | 'cumulative'>('category');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedYears, setSelectedYears] = useState(10);

  // Prepare cost breakdown data
  const costCategories = useMemo<CostCategory[]>(() => {
    if (!results) return [];
    
    const years = selectedYears;
    const categories: CostCategory[] = [
      {
        name: 'Purchase & Infrastructure',
        diesel: results.diesel.netUpfrontCost,
        bev: results.bev.netUpfrontCost,
        color: '#3b82f6'
      },
      {
        name: 'Fuel/Energy',
        diesel: results.diesel.fuelCostPerMile * dieselInputs.milesPerYear * years,
        bev: results.bev.fuelCostPerMile * bevInputs.milesPerYear * years,
        color: '#f59e0b'
      },
      {
        name: 'Maintenance',
        diesel: dieselInputs.maintenancePerMile * dieselInputs.milesPerYear * years,
        bev: bevInputs.maintenancePerMile * bevInputs.milesPerYear * years,
        color: '#10b981'
      },
      {
        name: 'Insurance & Other',
        diesel: (dieselInputs.insurancePerMile + dieselInputs.otherPerMile) * dieselInputs.milesPerYear * years,
        bev: (bevInputs.insurancePerMile + bevInputs.otherPerMile) * bevInputs.milesPerYear * years,
        color: '#8b5cf6'
      }
    ];

    if (enableLCFS && results.bev.lcfsRevenuePerYear) {
      categories.push({
        name: 'LCFS Revenue',
        diesel: 0,
        bev: -results.bev.lcfsRevenuePerYear * years,
        color: '#10b981'
      });
    }

    return categories;
  }, [results, dieselInputs, bevInputs, enableLCFS, selectedYears]);

  // Prepare yearly breakdown data
  const yearlyData = useMemo(() => {
    if (!results) return [];
    
    const data = [];
    for (let year = 1; year <= selectedYears; year++) {
      const dieselFuel = results.diesel.fuelCostPerMile * dieselInputs.milesPerYear;
      const bevFuel = results.bev.fuelCostPerMile * bevInputs.milesPerYear;
      const dieselMaint = dieselInputs.maintenancePerMile * dieselInputs.milesPerYear;
      const bevMaint = bevInputs.maintenancePerMile * bevInputs.milesPerYear;
      const dieselOther = (dieselInputs.insurancePerMile + dieselInputs.otherPerMile) * dieselInputs.milesPerYear;
      const bevOther = (bevInputs.insurancePerMile + bevInputs.otherPerMile) * bevInputs.milesPerYear;
      
      data.push({
        year: `Year ${year}`,
        'Diesel Fuel': dieselFuel,
        'Diesel Maintenance': dieselMaint,
        'Diesel Other': dieselOther,
        'BEV Energy': bevFuel,
        'BEV Maintenance': bevMaint,
        'BEV Other': bevOther,
        'BEV LCFS': enableLCFS && results.bev.lcfsRevenuePerYear ? -results.bev.lcfsRevenuePerYear : 0,
        'Diesel Total': dieselFuel + dieselMaint + dieselOther,
        'BEV Total': bevFuel + bevMaint + bevOther - (enableLCFS && results.bev.lcfsRevenuePerYear ? results.bev.lcfsRevenuePerYear : 0)
      });
    }
    
    // Add upfront costs to year 1
    if (data.length > 0) {
      (data[0] as any)['Diesel Upfront'] = results.diesel.netUpfrontCost;
      (data[0] as any)['BEV Upfront'] = results.bev.netUpfrontCost;
      (data[0] as any)['Diesel Total'] += results.diesel.netUpfrontCost;
      (data[0] as any)['BEV Total'] += results.bev.netUpfrontCost;
    }
    
    return data;
  }, [results, dieselInputs, bevInputs, enableLCFS, selectedYears]);

  // Prepare cumulative comparison data
  const cumulativeData = useMemo(() => {
    if (!results) return [];
    
    const data = [];
    for (let i = 0; i < selectedYears; i++) {
      data.push({
        year: i + 1,
        diesel: results.diesel.yearlyTotalCosts[i] || 0,
        bev: results.bev.yearlyTotalCosts[i] || 0,
        savings: (results.diesel.yearlyTotalCosts[i] || 0) - (results.bev.yearlyTotalCosts[i] || 0)
      });
    }
    return data;
  }, [results, selectedYears]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(Math.abs(entry.value))}
              {entry.value < 0 && ' (credit)'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const categoryColors: Record<string, string> = {
    'Diesel Fuel': '#ef4444',
    'Diesel Maintenance': '#dc2626',
    'Diesel Other': '#b91c1c',
    'Diesel Upfront': '#991b1b',
    'BEV Energy': '#22c55e',
    'BEV Maintenance': '#16a34a',
    'BEV Other': '#15803d',
    'BEV Upfront': '#166534',
    'BEV LCFS': '#10b981'
  };

  return (
    <CalculatorLayout
      title="Cost Breakdown Analysis"
      description="Detailed stacked bar charts showing cost categories over time"
      icon={<BarChart3 className="h-6 w-6" />}
      preparedFor={preparedFor}
      preparedBy={preparedBy}
      onPreparedForChange={setPreparedFor}
      onPreparedByChange={setPreparedBy}
    >
      <div className="space-y-6">
        {/* Controls */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex gap-2">
              <Button
                variant={selectedView === 'category' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('category')}
              >
                <Layers className="h-4 w-4 mr-2" />
                By Category
              </Button>
              <Button
                variant={selectedView === 'yearly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('yearly')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Yearly Breakdown
              </Button>
              <Button
                variant={selectedView === 'cumulative' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('cumulative')}
              >
                <Info className="h-4 w-4 mr-2" />
                Cumulative
              </Button>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedYears}
                onChange={(e) => setSelectedYears(Number(e.target.value))}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value={5}>5 Years</option>
                <option value={10}>10 Years</option>
                <option value={15}>15 Years</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedView === 'category' && 'Cost Breakdown by Category'}
              {selectedView === 'yearly' && 'Yearly Cost Analysis'}
              {selectedView === 'cumulative' && 'Cumulative Cost Comparison'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {selectedView === 'category' ? (
                  <BarChart data={costCategories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="diesel" name="Diesel" fill="#ef4444" />
                    <Bar dataKey="bev" name="BEV" fill="#22c55e" />
                  </BarChart>
                ) : selectedView === 'yearly' ? (
                  <BarChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {yearlyData.length > 0 && Object.keys(yearlyData[0])
                      .filter(key => key !== 'year' && !key.includes('Total'))
                      .map((key) => (
                        <Bar
                          key={key}
                          dataKey={key}
                          stackId={key.includes('Diesel') ? 'diesel' : 'bev'}
                          fill={categoryColors[key]}
                          name={key}
                        />
                      ))}
                  </BarChart>
                ) : (
                  <ComposedChart data={cumulativeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="diesel" name="Diesel Total" fill="#ef4444" />
                    <Bar dataKey="bev" name="BEV Total" fill="#22c55e" />
                    <Line type="monotone" dataKey="savings" name="Savings" stroke="#3b82f6" strokeWidth={3} />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-gray-600">Largest Cost Category</h3>
              <p className="text-lg font-semibold mt-2">
                {costCategories.reduce((max, cat) => 
                  (cat.diesel + cat.bev > max.total) ? { name: cat.name, total: cat.diesel + cat.bev } : max,
                  { name: '', total: 0 }
                ).name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatCurrency(
                  costCategories.reduce((max, cat) => 
                    (cat.diesel + cat.bev > max) ? cat.diesel + cat.bev : max, 0
                  ) / 2
                )} average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-gray-600">Fuel/Energy Savings</h3>
              <p className="text-lg font-semibold mt-2">
                {results && formatCurrency(
                  (results.diesel.fuelCostPerMile - results.bev.fuelCostPerMile) * 
                  dieselInputs.milesPerYear * selectedYears
                )}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Over {selectedYears} years
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-gray-600">Maintenance Savings</h3>
              <p className="text-lg font-semibold mt-2">
                {formatCurrency(
                  (dieselInputs.maintenancePerMile - bevInputs.maintenancePerMile) * 
                  dieselInputs.milesPerYear * selectedYears
                )}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatPerMile(dieselInputs.maintenancePerMile - bevInputs.maintenancePerMile)}/mile
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card>
            <CardHeader>
              <CardTitle>Adjust Cost Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="fuel" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="fuel">Fuel/Energy</TabsTrigger>
                  <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                  <TabsTrigger value="other">Other Costs</TabsTrigger>
                </TabsList>

                <TabsContent value="fuel" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label>Diesel MPG</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={dieselInputs.efficiency}
                        onChange={(e) => updateDieselInput('efficiency', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>BEV kWh/mile</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={bevInputs.efficiency}
                        onChange={(e) => updateBEVInput('efficiency', e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="maintenance" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Diesel Maintenance ($/mile)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={dieselInputs.maintenancePerMile}
                        onChange={(e) => updateDieselInput('maintenancePerMile', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>BEV Maintenance ($/mile)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={bevInputs.maintenancePerMile}
                        onChange={(e) => updateBEVInput('maintenancePerMile', e.target.value)}
                      />
                    </div>
                  </div>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      BEVs typically have 20-40% lower maintenance costs due to fewer moving parts
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="other" className="space-y-4">
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
                      <Label>Insurance ($/mile)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={dieselInputs.insurancePerMile}
                        onChange={(e) => {
                          updateDieselInput('insurancePerMile', e.target.value);
                          updateBEVInput('insurancePerMile', e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enable-lcfs-stacked"
                      checked={enableLCFS}
                      onChange={(e) => setEnableLCFS(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="enable-lcfs-stacked">Include LCFS revenue (CA, WA, OR)</Label>
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