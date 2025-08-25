'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Calculator, TrendingUp, Truck, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  BEVCostCalculator as BEVCalculator,
  VehicleInputs,
  LCFSInputs,
  defaultDieselInputs,
  defaultBEVInputs,
  defaultLCFSInputs
} from '@/lib/calculators/bev-cost-calculator';

export default function FreightlinerStyleCalculator() {
  // State management
  const [activeTab, setActiveTab] = useState('configuration');
  const [mounted, setMounted] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // Business information
  const [companyName, setCompanyName] = useState('');
  const [fleetSize, setFleetSize] = useState('');
  const [vehicleClass, setVehicleClass] = useState('Class 6');
  const [operationType, setOperationType] = useState('Local Delivery');
  
  // Vehicle inputs with commercial defaults
  const [dieselInputs, setDieselInputs] = useState<VehicleInputs>({
    ...defaultDieselInputs,
    truckCost: 180000, // Commercial truck cost
    milesPerYear: 50000, // Higher commercial mileage
    fuelPrice: 4.50, // Commercial diesel price
    efficiency: 6.5, // Commercial truck MPG
    maintenancePerMile: 0.18 // Higher commercial maintenance
  });
  
  const [bevInputs, setBevInputs] = useState<VehicleInputs>({
    ...defaultBEVInputs,
    truckCost: 380000, // Electric commercial truck
    infrastructureCost: 75000, // Commercial charging infrastructure
    milesPerYear: 50000,
    fuelPrice: 0.12, // Commercial electricity rate
    efficiency: 2.2, // kWh/mile for commercial EV
    maintenancePerMile: 0.12 // Lower EV maintenance
  });
  
  const [lcfsInputs] = useState<LCFSInputs>(defaultLCFSInputs);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculateResults = useCallback(() => {
    const calculator = new BEVCalculator(dieselInputs, bevInputs, lcfsInputs);
    const calculatedResults = calculator.calculate();
    setResults(calculatedResults);
  }, [dieselInputs, bevInputs, lcfsInputs]);

  useEffect(() => {
    if (mounted) {
      calculateResults();
    }
  }, [mounted, calculateResults]);

  const updateDieselInput = (field: keyof VehicleInputs, value: string) => {
    setDieselInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const updateBEVInput = (field: keyof VehicleInputs, value: string) => {
    setBevInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPerMile = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(value);
  };

  // Prepare chart data
  const chartData = results ? Array.from({ length: 10 }, (_, i) => ({
    year: `Year ${i + 1}`,
    diesel: results.diesel.yearlyTotalCosts[i],
    bev: results.bev.yearlyTotalCosts[i],
  })) : [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Professional Header */}
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <Building2 className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl font-bold">Commercial EV TCO Calculator</h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl">
            Professional Total Cost of Ownership analysis for commercial electric vehicles. 
            Make informed fleet electrification decisions with comprehensive financial modeling.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="configuration" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Fleet Configuration
            </TabsTrigger>
            <TabsTrigger value="specifications" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Vehicle Specifications
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Cost Analysis
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Summary
            </TabsTrigger>
          </TabsList>

          {/* Fleet Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fleet Information</CardTitle>
                <CardDescription>
                  Configure your fleet specifications for accurate TCO modeling
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your Company"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fleet-size">Fleet Size</Label>
                    <Input
                      id="fleet-size"
                      type="number"
                      value={fleetSize}
                      onChange={(e) => setFleetSize(e.target.value)}
                      placeholder="Number of vehicles"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="vehicle-class">Vehicle Class</Label>
                    <Select value={vehicleClass} onValueChange={setVehicleClass}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Class 4">Class 4 (14,001-16,000 lbs)</SelectItem>
                        <SelectItem value="Class 5">Class 5 (16,001-19,500 lbs)</SelectItem>
                        <SelectItem value="Class 6">Class 6 (19,501-26,000 lbs)</SelectItem>
                        <SelectItem value="Class 7">Class 7 (26,001-33,000 lbs)</SelectItem>
                        <SelectItem value="Class 8">Class 8 (33,001+ lbs)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="operation-type">Operation Type</Label>
                    <Select value={operationType} onValueChange={setOperationType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Local Delivery">Local Delivery</SelectItem>
                        <SelectItem value="Regional Haul">Regional Haul</SelectItem>
                        <SelectItem value="Construction">Construction</SelectItem>
                        <SelectItem value="Waste Management">Waste Management</SelectItem>
                        <SelectItem value="Food Service">Food Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicle Specifications Tab */}
          <TabsContent value="specifications" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Diesel Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-700">Diesel Vehicle</CardTitle>
                  <CardDescription>Current fleet specifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="diesel-truck-cost">Vehicle Cost</Label>
                      <Input
                        id="diesel-truck-cost"
                        type="number"
                        value={dieselInputs.truckCost}
                        onChange={(e) => updateDieselInput('truckCost', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="diesel-fuel-price">Diesel Price ($/gal)</Label>
                      <Input
                        id="diesel-fuel-price"
                        type="number"
                        step="0.01"
                        value={dieselInputs.fuelPrice}
                        onChange={(e) => updateDieselInput('fuelPrice', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="diesel-efficiency">Fuel Efficiency (MPG)</Label>
                      <Input
                        id="diesel-efficiency"
                        type="number"
                        step="0.1"
                        value={dieselInputs.efficiency}
                        onChange={(e) => updateDieselInput('efficiency', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="diesel-miles">Annual Miles</Label>
                      <Input
                        id="diesel-miles"
                        type="number"
                        value={dieselInputs.milesPerYear}
                        onChange={(e) => updateDieselInput('milesPerYear', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="diesel-maintenance">Maintenance ($/mile)</Label>
                      <Input
                        id="diesel-maintenance"
                        type="number"
                        step="0.01"
                        value={dieselInputs.maintenancePerMile}
                        onChange={(e) => updateDieselInput('maintenancePerMile', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="diesel-residual">Residual Value</Label>
                      <Input
                        id="diesel-residual"
                        type="number"
                        value={dieselInputs.residualValue}
                        onChange={(e) => updateDieselInput('residualValue', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Electric Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-emerald-700">Electric Vehicle</CardTitle>
                  <CardDescription>Proposed electric fleet specifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bev-truck-cost">Vehicle Cost</Label>
                      <Input
                        id="bev-truck-cost"
                        type="number"
                        value={bevInputs.truckCost}
                        onChange={(e) => updateBEVInput('truckCost', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bev-infra-cost">Infrastructure Cost</Label>
                      <Input
                        id="bev-infra-cost"
                        type="number"
                        value={bevInputs.infrastructureCost}
                        onChange={(e) => updateBEVInput('infrastructureCost', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bev-fuel-price">Electricity ($/kWh)</Label>
                      <Input
                        id="bev-fuel-price"
                        type="number"
                        step="0.01"
                        value={bevInputs.fuelPrice}
                        onChange={(e) => updateBEVInput('fuelPrice', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bev-efficiency">Efficiency (kWh/mile)</Label>
                      <Input
                        id="bev-efficiency"
                        type="number"
                        step="0.1"
                        value={bevInputs.efficiency}
                        onChange={(e) => updateBEVInput('efficiency', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bev-maintenance">Maintenance ($/mile)</Label>
                      <Input
                        id="bev-maintenance"
                        type="number"
                        step="0.01"
                        value={bevInputs.maintenancePerMile}
                        onChange={(e) => updateBEVInput('maintenancePerMile', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bev-residual">Residual Value</Label>
                      <Input
                        id="bev-residual"
                        type="number"
                        value={bevInputs.residualValue}
                        onChange={(e) => updateBEVInput('residualValue', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cost Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {results && (
              <Card>
                <CardHeader>
                  <CardTitle>10-Year Total Cost of Ownership</CardTitle>
                  <CardDescription>
                    Comprehensive cost comparison over operational lifetime
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="diesel" fill="#d97706" name="Diesel Fleet" />
                        <Bar dataKey="bev" fill="#059669" name="Electric Fleet" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Financial Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {results && (
              <div className="grid grid-cols-3 gap-6">
                {/* Cost Summary Table */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Detailed Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 p-3 text-left font-semibold">Cost Category</th>
                            <th className="border border-slate-300 p-3 text-right font-semibold">Diesel</th>
                            <th className="border border-slate-300 p-3 text-right font-semibold">Electric</th>
                            <th className="border border-slate-300 p-3 text-right font-semibold">Difference</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-slate-300 p-3">Net Upfront Cost</td>
                            <td className="border border-slate-300 p-3 text-right">{formatCurrency(results.diesel.netUpfrontCost)}</td>
                            <td className="border border-slate-300 p-3 text-right">{formatCurrency(results.bev.netUpfrontCost)}</td>
                            <td className="border border-slate-300 p-3 text-right text-red-600">
                              {formatCurrency(results.bev.netUpfrontCost - results.diesel.netUpfrontCost)}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3">Fuel Cost per Mile</td>
                            <td className="border border-slate-300 p-3 text-right">{formatPerMile(results.diesel.fuelCostPerMile)}</td>
                            <td className="border border-slate-300 p-3 text-right">{formatPerMile(results.bev.fuelCostPerMile)}</td>
                            <td className="border border-slate-300 p-3 text-right text-green-600">
                              -{formatPerMile(results.diesel.fuelCostPerMile - results.bev.fuelCostPerMile)}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3">Total Operating Cost per Mile</td>
                            <td className="border border-slate-300 p-3 text-right">{formatPerMile(results.diesel.totalOperatingCostPerMile)}</td>
                            <td className="border border-slate-300 p-3 text-right">{formatPerMile(results.bev.totalOperatingCostPerMile)}</td>
                            <td className="border border-slate-300 p-3 text-right text-green-600">
                              -{formatPerMile(results.diesel.totalOperatingCostPerMile - results.bev.totalOperatingCostPerMile)}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3">Annual Operating Cost</td>
                            <td className="border border-slate-300 p-3 text-right">{formatCurrency(results.diesel.annualOperatingCost)}</td>
                            <td className="border border-slate-300 p-3 text-right">{formatCurrency(results.bev.annualOperatingCost)}</td>
                            <td className="border border-slate-300 p-3 text-right text-green-600">
                              -{formatCurrency(results.diesel.annualOperatingCost - results.bev.annualOperatingCost)}
                            </td>
                          </tr>
                          <tr className="bg-slate-50 font-semibold">
                            <td className="border border-slate-300 p-3">10-Year Total Cost</td>
                            <td className="border border-slate-300 p-3 text-right">{formatCurrency(results.diesel.yearlyTotalCosts[9])}</td>
                            <td className="border border-slate-300 p-3 text-right">{formatCurrency(results.bev.yearlyTotalCosts[9])}</td>
                            <td className={`border border-slate-300 p-3 text-right font-bold ${
                              results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9] > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9] > 0 ? '-' : '+'}{formatCurrency(Math.abs(results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9]))}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <h4 className="font-semibold text-emerald-800 mb-2">10-Year Savings</h4>
                      <p className={`text-2xl font-bold ${
                        results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9] > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9])}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Break-even Point</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {(() => {
                          const breakEvenIndex = results.bev.yearlyTotalCosts.findIndex(
                            (cost: number, i: number) => cost < results.diesel.yearlyTotalCosts[i]
                          );
                          return breakEvenIndex === -1 ? 'Beyond 10 years' : `Year ${breakEvenIndex + 1}`;
                        })()}
                      </p>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-lg">
                      <h4 className="font-semibold text-amber-800 mb-2">Annual Fuel Savings</h4>
                      <p className="text-2xl font-bold text-amber-600">
                        {formatCurrency(results.diesel.annualOperatingCost - results.bev.annualOperatingCost)}
                      </p>
                    </div>

                    {fleetSize && (
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-semibold text-purple-800 mb-2">Fleet Total (10-year)</h4>
                        <p className="text-2xl font-bold text-purple-600">
                          {formatCurrency((results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9]) * parseInt(fleetSize))}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}