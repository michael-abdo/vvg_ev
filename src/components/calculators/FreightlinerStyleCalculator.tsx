'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Calculator, TrendingUp, DollarSign, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('specifications');
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
          
          {/* Prepared for/by section */}
          <div className="mt-6 grid grid-cols-2 gap-4 max-w-md">
            <div>
              <Label htmlFor="prepared-for" className="text-slate-300 text-sm">Prepared for</Label>
              <Input
                id="prepared-for"
                value={preparedFor}
                onChange={(e) => setPreparedFor(e.target.value)}
                placeholder="Company name"
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
              />
            </div>
            <div>
              <Label htmlFor="prepared-by" className="text-slate-300 text-sm">Prepared by</Label>
              <Input
                id="prepared-by"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                placeholder="Your name"
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="specifications" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Vehicle Specifications
            </TabsTrigger>
            <TabsTrigger value="lcfs" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              LCFS Configuration
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
                  <div>
                    <h4 className="font-semibold mb-3">Upfront Costs</h4>
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
                        <Label htmlFor="diesel-infra-cost">Infrastructure Cost</Label>
                        <Input
                          id="diesel-infra-cost"
                          type="number"
                          value={dieselInputs.infrastructureCost}
                          onChange={(e) => updateDieselInput('infrastructureCost', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Incentives</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="diesel-truck-incentive">Truck Incentive</Label>
                        <Input
                          id="diesel-truck-incentive"
                          type="number"
                          value={dieselInputs.truckIncentive}
                          onChange={(e) => updateDieselInput('truckIncentive', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="diesel-infra-incentive">Infrastructure Incentive</Label>
                        <Input
                          id="diesel-infra-incentive"
                          type="number"
                          value={dieselInputs.infrastructureIncentive}
                          onChange={(e) => updateDieselInput('infrastructureIncentive', e.target.value)}
                        />
                      </div>
                    </div>
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

                  <div>
                    <h4 className="font-semibold mb-3">Operating Costs</h4>
                    <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="diesel-insurance">Insurance ($/mile)</Label>
                        <Input
                          id="diesel-insurance"
                          type="number"
                          step="0.01"
                          value={dieselInputs.insurancePerMile}
                          onChange={(e) => updateDieselInput('insurancePerMile', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="diesel-other">Other ($/mile)</Label>
                        <Input
                          id="diesel-other"
                          type="number"
                          step="0.01"
                          value={dieselInputs.otherPerMile}
                          onChange={(e) => updateDieselInput('otherPerMile', e.target.value)}
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
                </CardContent>
              </Card>

              {/* Electric Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-emerald-700">Electric Vehicle</CardTitle>
                  <CardDescription>Proposed electric fleet specifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Upfront Costs</h4>
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
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Incentives</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bev-truck-incentive">Truck Incentive</Label>
                        <Input
                          id="bev-truck-incentive"
                          type="number"
                          value={bevInputs.truckIncentive}
                          onChange={(e) => updateBEVInput('truckIncentive', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bev-infra-incentive">Infrastructure Incentive</Label>
                        <Input
                          id="bev-infra-incentive"
                          type="number"
                          value={bevInputs.infrastructureIncentive}
                          onChange={(e) => updateBEVInput('infrastructureIncentive', e.target.value)}
                        />
                      </div>
                    </div>
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

                  <div>
                    <h4 className="font-semibold mb-3">Operating Costs</h4>
                    <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="bev-insurance">Insurance ($/mile)</Label>
                        <Input
                          id="bev-insurance"
                          type="number"
                          step="0.01"
                          value={bevInputs.insurancePerMile}
                          onChange={(e) => updateBEVInput('insurancePerMile', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bev-other">Other ($/mile)</Label>
                        <Input
                          id="bev-other"
                          type="number"
                          step="0.01"
                          value={bevInputs.otherPerMile}
                          onChange={(e) => updateBEVInput('otherPerMile', e.target.value)}
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* LCFS Configuration Tab */}
          <TabsContent value="lcfs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Low Carbon Fuel Standard (LCFS)</CardTitle>
                <CardDescription>
                  Available in CA, WA, OR. Enable to include LCFS credit revenue in calculations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enable-lcfs"
                    checked={enableLCFS}
                    onChange={(e) => setEnableLCFS(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="enable-lcfs">Enable LCFS calculations</Label>
                </div>

                {enableLCFS && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="lcfs-credit-price">LCFS Credit Price ($/credit)</Label>
                      <Input
                        id="lcfs-credit-price"
                        type="number"
                        value={lcfsInputs.lcfsCreditPrice}
                        onChange={(e) => updateLCFSInput('lcfsCreditPrice', e.target.value)}
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="lcfs-diesel-ci">Diesel CI (gCO2e/MJ)</Label>
                      <Input
                        id="lcfs-diesel-ci"
                        type="number"
                        step="0.01"
                        value={lcfsInputs.dieselCI}
                        onChange={(e) => updateLCFSInput('dieselCI', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lcfs-elec-ci">Electricity CI (gCO2e/MJ)</Label>
                      <Input
                        id="lcfs-elec-ci"
                        type="number"
                        step="0.01"
                        value={lcfsInputs.electricityCI}
                        onChange={(e) => updateLCFSInput('electricityCI', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {results && (
              <>
                {/* Visual Cost Comparison Chart */}
                <div 
                  className="relative rounded-lg overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 text-white p-8"
                  style={{
                    backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%), 
                                     radial-gradient(circle at 20% 80%, rgba(34,197,94,0.1) 0%, transparent 50%),
                                     radial-gradient(circle at 80% 20%, rgba(59,130,246,0.1) 0%, transparent 50%)`,
                    backgroundBlendMode: 'overlay'
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <button className="p-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors opacity-50">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="text-center">
                      <p className="text-sm text-white/60 uppercase tracking-wide mb-2">Calculator Results</p>
                      <h3 className="text-3xl font-bold">Total Cost of Ownership</h3>
                    </div>
                    <button className="p-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors opacity-50">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Mobile Summary */}
                  <div className="flex md:hidden justify-around mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        <sup className="text-xs font-normal">$</sup>
                        {Math.round(results.bev.yearlyTotalCosts[9]).toLocaleString()}
                      </div>
                      <div className="text-xs uppercase text-white/60">Electric</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        <sup className="text-xs font-normal">$</sup>
                        {Math.round(results.diesel.yearlyTotalCosts[9]).toLocaleString()}
                      </div>
                      <div className="text-xs uppercase text-white/60">Diesel</div>
                    </div>
                  </div>

                  {/* Bar Chart Visualization */}
                  <div className="relative h-96 md:h-[500px] flex items-end gap-8 px-4 md:px-16">
                    {(() => {
                      const maxCost = Math.max(results.diesel.yearlyTotalCosts[9], results.bev.yearlyTotalCosts[9]);
                      const beverHeight = (results.bev.yearlyTotalCosts[9] / maxCost) * 80; // 80% max height for visual balance
                      const dieselHeight = (results.diesel.yearlyTotalCosts[9] / maxCost) * 80; // 80% max height for visual balance
                      
                      return (
                        <>
                          {/* Electric Bar */}
                          <div className="flex-1 flex flex-col items-center justify-end h-full">
                            <div 
                              className="w-full bg-gradient-to-t from-emerald-600/80 to-emerald-400 rounded-t-2xl border border-emerald-400/20 flex items-center justify-center"
                              style={{
                                height: `${beverHeight}%`,
                                minHeight: '120px',
                                boxShadow: '0 -10px 40px rgba(34,197,94,0.3), inset 0 2px 10px rgba(255,255,255,0.2)',
                                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                            >
                              <div className="p-4 text-center">
                                <div className="text-2xl md:text-3xl font-bold mb-2">
                                  <sup className="text-xs md:text-sm font-normal">$</sup>
                                  {Math.round(results.bev.yearlyTotalCosts[9]).toLocaleString()}
                                </div>
                                <div className="text-xs md:text-sm opacity-90">10 years</div>
                                <div className="text-xs md:text-sm opacity-90">{bevInputs.milesPerYear.toLocaleString()} miles/year</div>
                                <div className="text-xs md:text-sm opacity-90">{formatPerMile(results.bev.totalOperatingCostPerMile)}/mile</div>
                              </div>
                            </div>
                            <div className="mt-4 text-lg font-semibold uppercase tracking-wide">Electric</div>
                          </div>

                          {/* Diesel Bar */}
                          <div className="flex-1 flex flex-col items-center justify-end h-full">
                            <div 
                              className="w-full bg-gradient-to-t from-amber-700/80 to-amber-500 rounded-t-2xl border border-amber-400/20 flex items-center justify-center"
                              style={{
                                height: `${dieselHeight}%`,
                                minHeight: '120px',
                                boxShadow: '0 -10px 40px rgba(217,119,6,0.3), inset 0 2px 10px rgba(255,255,255,0.2)',
                                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                            >
                              <div className="p-4 text-center">
                                <div className="text-2xl md:text-3xl font-bold mb-2">
                                  <sup className="text-xs md:text-sm font-normal">$</sup>
                                  {Math.round(results.diesel.yearlyTotalCosts[9]).toLocaleString()}
                                </div>
                                <div className="text-xs md:text-sm opacity-90">10 years</div>
                                <div className="text-xs md:text-sm opacity-90">{dieselInputs.milesPerYear.toLocaleString()} miles/year</div>
                                <div className="text-xs md:text-sm opacity-90">{formatPerMile(results.diesel.totalOperatingCostPerMile)}/mile</div>
                              </div>
                            </div>
                            <div className="mt-4 text-lg font-semibold uppercase tracking-wide">Diesel</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Traditional Chart Below */}
                <Card>
                  <CardHeader>
                    <CardTitle>Year-by-Year Cost Breakdown</CardTitle>
                    <CardDescription>
                      Detailed cost progression over 10 years
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
              </>
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
                          {results.bev.lcfsRevenuePerYear && (
                            <tr>
                              <td className="border border-slate-300 p-3">LCFS Revenue per Year</td>
                              <td className="border border-slate-300 p-3 text-right">-</td>
                              <td className="border border-slate-300 p-3 text-right text-green-600">+{formatCurrency(results.bev.lcfsRevenuePerYear)}</td>
                              <td className="border border-slate-300 p-3 text-right text-green-600">
                                +{formatCurrency(results.bev.lcfsRevenuePerYear)}
                              </td>
                            </tr>
                          )}
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
                        {formatCurrency((results.diesel.fuelCostPerMile - results.bev.fuelCostPerMile) * dieselInputs.milesPerYear)}
                      </p>
                    </div>

                    {results.bev.lcfsRevenuePerYear && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Annual LCFS Revenue</h4>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(results.bev.lcfsRevenuePerYear)}
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