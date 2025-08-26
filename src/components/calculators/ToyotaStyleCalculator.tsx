'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Car, Zap, DollarSign, Leaf, TrendingUp, Truck, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  BEVCostCalculator as BEVCalculator,
  VehicleInputs,
  LCFSInputs,
  defaultDieselInputs,
  defaultBEVInputs,
  defaultLCFSInputs
} from '@/lib/calculators/bev-cost-calculator';

export default function ToyotaStyleCalculator() {
  const [mounted, setMounted] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // Header information
  const [preparedFor, setPreparedFor] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  
  // Vehicle inputs using original calculator defaults
  const [dieselInputs, setDieselInputs] = useState<VehicleInputs>(defaultDieselInputs);
  const [bevInputs, setBevInputs] = useState<VehicleInputs>(defaultBEVInputs);
  
  // LCFS
  const [lcfsInputs, setLcfsInputs] = useState<LCFSInputs>(defaultLCFSInputs);
  const [enableLCFS, setEnableLCFS] = useState(false);

  // Vehicle selection
  const [selectedDieselTruck, setSelectedDieselTruck] = useState('isuzu-n-series');
  const [selectedElectricTruck, setSelectedElectricTruck] = useState('lightning-emotors');

  // Truck data
  const truckModels = {
    diesel: [
      { id: 'isuzu-n-series', name: 'Isuzu N Series', cost: 65000, mpg: 8.5, maintenance: 0.65 },
      { id: 'hino-m5', name: 'Hino M5', cost: 72000, mpg: 7.8, maintenance: 0.68 },
      { id: 'freightliner-m2', name: 'Freightliner M2 Class 6', cost: 85000, mpg: 7.2, maintenance: 0.72 },
    ],
    electric: [
      { id: 'lightning-emotors', name: 'Lightning eMotors', cost: 185000, efficiency: 1.8, maintenance: 0.35 },
      { id: 'workhorse-c1000', name: 'Workhorse C1000', cost: 175000, efficiency: 2.0, maintenance: 0.38 },
      { id: 'byd-6f', name: 'BYD 6F', cost: 165000, efficiency: 1.9, maintenance: 0.36 },
    ]
  };

  // Update inputs when truck selection changes
  const updateDieselTruck = (truckId: string) => {
    const truck = truckModels.diesel.find(t => t.id === truckId);
    if (truck) {
      setSelectedDieselTruck(truckId);
      setDieselInputs(prev => ({
        ...prev,
        truckCost: truck.cost,
        efficiency: truck.mpg,
        maintenancePerMile: truck.maintenance
      }));
    }
  };

  const updateElectricTruck = (truckId: string) => {
    const truck = truckModels.electric.find(t => t.id === truckId);
    if (truck) {
      setSelectedElectricTruck(truckId);
      setBevInputs(prev => ({
        ...prev,
        truckCost: truck.cost,
        efficiency: truck.efficiency,
        maintenancePerMile: truck.maintenance
      }));
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculateResults = useCallback(() => {
    const calculator = new BEVCalculator(dieselInputs, bevInputs, enableLCFS ? lcfsInputs : undefined);
    const calculatedResults = calculator.calculate();
    setResults(calculatedResults);
  }, [dieselInputs, bevInputs, lcfsInputs, enableLCFS]);

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

  const updateLCFSInput = (field: keyof LCFSInputs, value: string) => {
    setLcfsInputs(prev => ({
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Prepare chart data
  const chartData = results ? Array.from({ length: 10 }, (_, i) => ({
    year: `Year ${i + 1}`,
    'Gas Vehicle': results.diesel.yearlyTotalCosts[i],
    'Electric Vehicle': results.bev.yearlyTotalCosts[i],
  })) : [];

  const savingsProgress = results 
    ? Math.max(0, Math.min(100, ((results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9]) / results.diesel.yearlyTotalCosts[9]) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Consumer-friendly Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Electric Vehicle Savings Calculator
          </h1>
          <p className="text-xl text-gray-600">
            See how much you can save by switching to electric
          </p>
          
          {/* Prepared for/by section */}
          <div className="mt-4 grid grid-cols-2 gap-4 max-w-md">
            <div>
              <Label htmlFor="prepared-for" className="text-gray-700 text-sm">Name</Label>
              <Input
                id="prepared-for"
                value={preparedFor}
                onChange={(e) => setPreparedFor(e.target.value)}
                placeholder="Your name"
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="prepared-by" className="text-gray-700 text-sm">Prepared by</Label>
              <Input
                id="prepared-by"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                placeholder="Dealer/Company name"
                className="bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Vehicle Comparison Selector */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Choose Your Vehicles to Compare</h2>
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {/* Diesel Truck */}
            <div className="flex-1 max-w-xs">
              <div className="relative bg-white rounded-xl shadow-lg p-6 border-2 border-red-100">
                <div className="flex justify-center mb-4">
                  <div className="w-32 h-32 bg-red-50 rounded-lg flex items-center justify-center">
                    <Truck className="w-20 h-20 text-red-500" />
                  </div>
                </div>
                <Select value={selectedDieselTruck} onValueChange={updateDieselTruck}>
                  <SelectTrigger className="w-full bg-red-50 border-red-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {truckModels.diesel.map(truck => (
                      <SelectItem key={truck.id} value={truck.id}>
                        {truck.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-3 text-sm text-gray-600 text-center">
                  <p>Starting at {formatCurrency(dieselInputs.truckCost)}</p>
                  <p>{dieselInputs.efficiency} MPG</p>
                </div>
              </div>
            </div>

            {/* VS Widget */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-green-400 blur-xl opacity-20"></div>
                <div className="relative bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-2 border-gray-200">
                  <span className="font-bold text-gray-700">VS</span>
                </div>
              </div>
            </div>

            {/* Electric Truck */}
            <div className="flex-1 max-w-xs">
              <div className="relative bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
                <div className="flex justify-center mb-4">
                  <div className="w-32 h-32 bg-green-50 rounded-lg flex items-center justify-center">
                    <Zap className="w-20 h-20 text-green-500" />
                  </div>
                </div>
                <Select value={selectedElectricTruck} onValueChange={updateElectricTruck}>
                  <SelectTrigger className="w-full bg-green-50 border-green-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {truckModels.electric.map(truck => (
                      <SelectItem key={truck.id} value={truck.id}>
                        {truck.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-3 text-sm text-gray-600 text-center">
                  <p>Starting at {formatCurrency(bevInputs.truckCost)}</p>
                  <p>{bevInputs.efficiency} kWh/mile</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Gas Vehicle Card */}
            <Card className="border-2 border-red-100 shadow-lg">
              <CardHeader className="bg-red-50">
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <Car className="h-5 w-5" />
                  Your Current Gas Vehicle
                </CardTitle>
                <CardDescription>Tell us about your current vehicle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="diesel-truck-cost">Purchase Price</Label>
                    <Input
                      id="diesel-truck-cost"
                      type="number"
                      value={dieselInputs.truckCost}
                      onChange={(e) => updateDieselInput('truckCost', e.target.value)}
                      className="border-red-200 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="diesel-residual">Trade-in Value</Label>
                    <Input
                      id="diesel-residual"
                      type="number"
                      value={dieselInputs.residualValue}
                      onChange={(e) => updateDieselInput('residualValue', e.target.value)}
                      className="border-red-200 focus:ring-red-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="diesel-fuel-price">Gas Price ($/gallon)</Label>
                    <Input
                      id="diesel-fuel-price"
                      type="number"
                      step="0.01"
                      value={dieselInputs.fuelPrice}
                      onChange={(e) => updateDieselInput('fuelPrice', e.target.value)}
                      className="border-red-200 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="diesel-efficiency">Fuel Economy (MPG)</Label>
                    <Input
                      id="diesel-efficiency"
                      type="number"
                      step="0.1"
                      value={dieselInputs.efficiency}
                      onChange={(e) => updateDieselInput('efficiency', e.target.value)}
                      className="border-red-200 focus:ring-red-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="diesel-maintenance">Maintenance ($/mile)</Label>
                    <Input
                      id="diesel-maintenance"
                      type="number"
                      step="0.01"
                      value={dieselInputs.maintenancePerMile}
                      onChange={(e) => updateDieselInput('maintenancePerMile', e.target.value)}
                      className="border-red-200 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="diesel-miles">Miles per Year</Label>
                    <Input
                      id="diesel-miles"
                      type="number"
                      value={dieselInputs.milesPerYear}
                      onChange={(e) => updateDieselInput('milesPerYear', e.target.value)}
                      className="border-red-200 focus:ring-red-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Electric Vehicle Card */}
            <Card className="border-2 border-green-100 shadow-lg">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Zap className="h-5 w-5" />
                  New Electric Vehicle
                </CardTitle>
                <CardDescription>Configure your electric vehicle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bev-truck-cost">Vehicle Price</Label>
                    <Input
                      id="bev-truck-cost"
                      type="number"
                      value={bevInputs.truckCost}
                      onChange={(e) => updateBEVInput('truckCost', e.target.value)}
                      className="border-green-200 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bev-infra-cost">Home Charger Cost</Label>
                    <Input
                      id="bev-infra-cost"
                      type="number"
                      value={bevInputs.infrastructureCost}
                      onChange={(e) => updateBEVInput('infrastructureCost', e.target.value)}
                      className="border-green-200 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bev-truck-incentive">Federal Tax Credit</Label>
                    <Input
                      id="bev-truck-incentive"
                      type="number"
                      value={bevInputs.truckIncentive}
                      onChange={(e) => updateBEVInput('truckIncentive', e.target.value)}
                      className="border-green-200 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bev-infra-incentive">Charger Incentive</Label>
                    <Input
                      id="bev-infra-incentive"
                      type="number"
                      value={bevInputs.infrastructureIncentive}
                      onChange={(e) => updateBEVInput('infrastructureIncentive', e.target.value)}
                      className="border-green-200 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bev-fuel-price">Electricity ($/kWh)</Label>
                    <Input
                      id="bev-fuel-price"
                      type="number"
                      step="0.01"
                      value={bevInputs.fuelPrice}
                      onChange={(e) => updateBEVInput('fuelPrice', e.target.value)}
                      className="border-green-200 focus:ring-green-500"
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
                      className="border-green-200 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bev-maintenance">Maintenance ($/mile)</Label>
                    <Input
                      id="bev-maintenance"
                      type="number"
                      step="0.01"
                      value={bevInputs.maintenancePerMile}
                      onChange={(e) => updateBEVInput('maintenancePerMile', e.target.value)}
                      className="border-green-200 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bev-residual">Residual Value</Label>
                    <Input
                      id="bev-residual"
                      type="number"
                      value={bevInputs.residualValue}
                      onChange={(e) => updateBEVInput('residualValue', e.target.value)}
                      className="border-green-200 focus:ring-green-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LCFS Card */}
            <Card className="border-2 border-blue-100 shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Leaf className="h-5 w-5" />
                  Clean Fuel Credits (Optional)
                </CardTitle>
                <CardDescription>Available in CA, OR, WA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enable-lcfs"
                    checked={enableLCFS}
                    onChange={(e) => setEnableLCFS(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="enable-lcfs">Enable LCFS credit calculations</Label>
                </div>

                {enableLCFS && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="lcfs-credit-price">Credit Price ($/credit)</Label>
                      <Input
                        id="lcfs-credit-price"
                        type="number"
                        value={lcfsInputs.lcfsCreditPrice}
                        onChange={(e) => updateLCFSInput('lcfsCreditPrice', e.target.value)}
                        className="border-blue-200 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lcfs-eer">Energy Economy Ratio</Label>
                      <Input
                        id="lcfs-eer"
                        type="number"
                        step="0.1"
                        value={lcfsInputs.eer}
                        onChange={(e) => updateLCFSInput('eer', e.target.value)}
                        className="border-blue-200 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {results && (
              <>
                {/* Savings Summary Card */}
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-3xl font-bold">Your 10-Year Savings</CardTitle>
                    <CardDescription className="text-green-100">
                      By switching to electric
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold mb-4">
                      {formatCurrency(results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9])}
                    </div>
                    <Progress 
                      value={savingsProgress} 
                      className="h-4 bg-green-700"
                    />
                    <p className="text-sm text-green-100 mt-2">
                      That&apos;s {savingsProgress.toFixed(0)}% savings over 10 years!
                    </p>
                  </CardContent>
                </Card>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Break-even Point
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-blue-600">
                        {(() => {
                          const breakEvenIndex = results.bev.yearlyTotalCosts.findIndex(
                            (cost: number, i: number) => cost < results.diesel.yearlyTotalCosts[i]
                          );
                          return breakEvenIndex === -1 ? 'Beyond 10 years' : `Year ${breakEvenIndex + 1}`;
                        })()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Annual Fuel Savings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency((results.diesel.fuelCostPerMile - results.bev.fuelCostPerMile) * dieselInputs.milesPerYear)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Cost per Mile (Gas)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-red-600">
                        {formatPerMile(results.diesel.totalOperatingCostPerMile)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Cost per Mile (Electric)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600">
                        {formatPerMile(results.bev.totalOperatingCostPerMile)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Cost Comparison Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      10-Year Cost Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="year" stroke="#6b7280" />
                          <YAxis 
                            stroke="#6b7280"
                            tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} 
                          />
                          <Tooltip 
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="Gas Vehicle" 
                            stroke="#ef4444" 
                            strokeWidth={3}
                            dot={{ fill: '#ef4444' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="Electric Vehicle" 
                            stroke="#22c55e" 
                            strokeWidth={3}
                            dot={{ fill: '#22c55e' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Info */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Environmental Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Switching to electric will reduce your carbon footprint by approximately{' '}
                      <span className="font-bold text-green-600">
                        {((dieselInputs.milesPerYear / dieselInputs.efficiency * 8.89) / 1000).toFixed(1)} tons
                      </span>{' '}
                      of CO₂ per year.
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}