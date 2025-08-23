'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator as CalculatorIcon, TrendingUp, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  BEVCostCalculator as BEVCalculator,
  VehicleInputs,
  LCFSInputs,
  defaultDieselInputs,
  defaultBEVInputs,
  defaultLCFSInputs
} from '@/lib/calculators/bev-cost-calculator';

interface ComparisonChartProps {
  dieselCosts: number[];
  bevCosts: number[];
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ dieselCosts, bevCosts }) => {
  const maxCost = Math.max(...dieselCosts, ...bevCosts);
  const years = dieselCosts.length;
  
  return (
    <div className="w-full h-64 relative">
      <svg className="w-full h-full" viewBox={`0 0 ${years * 100} 250`}>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={i}
            x1="0"
            y1={50 + i * 50}
            x2={years * 100}
            y2={50 + i * 50}
            stroke="#e5e7eb"
            strokeDasharray="2 2"
          />
        ))}
        
        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4].map(i => (
          <text
            key={i}
            x="-10"
            y={250 - i * 50}
            textAnchor="end"
            className="text-xs fill-gray-500"
          >
            ${(maxCost * i / 4 / 1000).toFixed(0)}k
          </text>
        ))}
        
        {/* Diesel line */}
        <polyline
          points={dieselCosts.map((cost, i) => `${i * 100},${250 - (cost / maxCost) * 200}`).join(' ')}
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
        />
        
        {/* BEV line */}
        <polyline
          points={bevCosts.map((cost, i) => `${i * 100},${250 - (cost / maxCost) * 200}`).join(' ')}
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
        />
        
        {/* X-axis labels */}
        {dieselCosts.map((_, i) => (
          <text
            key={i}
            x={i * 100}
            y="270"
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            Year {i + 1}
          </text>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-red-500"></div>
          <span className="text-sm">Diesel</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-green-500"></div>
          <span className="text-sm">BEV</span>
        </div>
      </div>
    </div>
  );
};

export default function BEVCostCalculator() {
  const [dieselInputs, setDieselInputs] = useState<VehicleInputs>({
    ...defaultDieselInputs,
    insurancePerMile: defaultDieselInputs.insurancePerMile || 0,
    otherPerMile: defaultDieselInputs.otherPerMile || 0
  });
  const [bevInputs, setBevInputs] = useState<VehicleInputs>({
    ...defaultBEVInputs,
    insurancePerMile: defaultBEVInputs.insurancePerMile || 0,
    otherPerMile: defaultBEVInputs.otherPerMile || 0
  });
  const [lcfsInputs, setLcfsInputs] = useState<LCFSInputs>(defaultLCFSInputs);
  const [enableLCFS, setEnableLCFS] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [preparedFor, setPreparedFor] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [mounted, setMounted] = useState(false);
  const [lcfsOpen, setLcfsOpen] = useState(false);
  const [dieselOpen, setDieselOpen] = useState(true);
  const [bevOpen, setBevOpen] = useState(true);

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

  return (
    <div className="max-w-screen-2xl mx-auto p-4">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalculatorIcon className="h-6 w-6" />
            BEV Cost of Ownership Calculator
          </CardTitle>
          <CardDescription>
            Compare total cost of ownership between Diesel and Battery Electric Vehicles (BEV)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="prepared-for">Prepared for</Label>
              <Input
                id="prepared-for"
                value={preparedFor}
                onChange={(e) => setPreparedFor(e.target.value)}
                placeholder="Company name"
              />
            </div>
            <div>
              <Label htmlFor="prepared-by">Prepared by</Label>
              <Input
                id="prepared-by"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column - Inputs */}
        <div className="space-y-6">
          {/* Diesel Vehicle Inputs */}
          <Card>
            <Collapsible open={dieselOpen} onOpenChange={setDieselOpen}>
              <CardHeader>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-0 hover:bg-transparent"
                  >
                    <CardTitle>Diesel Vehicle</CardTitle>
                    <ChevronDown className={`h-4 w-4 transition-transform ${dieselOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Upfront Costs</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="diesel-truck-cost" className="text-sm">Truck Cost</Label>
                    <Input
                      id="diesel-truck-cost"
                      type="number"
                      value={dieselInputs.truckCost}
                      onChange={(e) => updateDieselInput('truckCost', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="diesel-infra-cost" className="text-sm">Infrastructure</Label>
                    <Input
                      id="diesel-infra-cost"
                      type="number"
                      value={dieselInputs.infrastructureCost}
                      onChange={(e) => updateDieselInput('infrastructureCost', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Incentives</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="diesel-truck-incentive" className="text-sm">Truck Incentive</Label>
                    <Input
                      id="diesel-truck-incentive"
                      type="number"
                      value={dieselInputs.truckIncentive}
                      onChange={(e) => updateDieselInput('truckIncentive', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="diesel-infra-incentive" className="text-sm">Infrastructure</Label>
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

              <div className="space-y-2">
                <Label>Operating Costs</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="diesel-fuel-price" className="text-sm">Fuel ($/gal)</Label>
                    <Input
                      id="diesel-fuel-price"
                      type="number"
                      step="0.01"
                      value={dieselInputs.fuelPrice}
                      onChange={(e) => updateDieselInput('fuelPrice', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="diesel-efficiency" className="text-sm">MPG</Label>
                    <Input
                      id="diesel-efficiency"
                      type="number"
                      step="0.1"
                      value={dieselInputs.efficiency}
                      onChange={(e) => updateDieselInput('efficiency', e.target.value)}
                    />
                  </div>
                </div>
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
                <Label htmlFor="diesel-miles">Miles per Year</Label>
                <Input
                  id="diesel-miles"
                  type="number"
                  value={dieselInputs.milesPerYear}
                  onChange={(e) => updateDieselInput('milesPerYear', e.target.value)}
                />
              </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* BEV Inputs */}
          <Card>
            <Collapsible open={bevOpen} onOpenChange={setBevOpen}>
              <CardHeader>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-0 hover:bg-transparent"
                  >
                    <CardTitle>Battery Electric Vehicle</CardTitle>
                    <ChevronDown className={`h-4 w-4 transition-transform ${bevOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Upfront Costs</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="bev-truck-cost" className="text-sm">Truck Cost</Label>
                    <Input
                      id="bev-truck-cost"
                      type="number"
                      value={bevInputs.truckCost}
                      onChange={(e) => updateBEVInput('truckCost', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bev-infra-cost" className="text-sm">Infrastructure</Label>
                    <Input
                      id="bev-infra-cost"
                      type="number"
                      value={bevInputs.infrastructureCost}
                      onChange={(e) => updateBEVInput('infrastructureCost', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Incentives</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="bev-truck-incentive" className="text-sm">Truck Incentive</Label>
                    <Input
                      id="bev-truck-incentive"
                      type="number"
                      value={bevInputs.truckIncentive}
                      onChange={(e) => updateBEVInput('truckIncentive', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bev-infra-incentive" className="text-sm">Infrastructure</Label>
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

              <div className="space-y-2">
                <Label>Operating Costs</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="bev-fuel-price" className="text-sm">Electricity ($/kWh)</Label>
                    <Input
                      id="bev-fuel-price"
                      type="number"
                      step="0.01"
                      value={bevInputs.fuelPrice}
                      onChange={(e) => updateBEVInput('fuelPrice', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bev-efficiency" className="text-sm">kWh/mile</Label>
                    <Input
                      id="bev-efficiency"
                      type="number"
                      step="0.1"
                      value={bevInputs.efficiency}
                      onChange={(e) => updateBEVInput('efficiency', e.target.value)}
                    />
                  </div>
                </div>
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
                <Label htmlFor="bev-miles">Miles per Year</Label>
                <Input
                  id="bev-miles"
                  type="number"
                  value={bevInputs.milesPerYear}
                  onChange={(e) => updateBEVInput('milesPerYear', e.target.value)}
                />
              </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* LCFS Section - Collapsible */}
          <Card>
            <Collapsible open={lcfsOpen} onOpenChange={setLcfsOpen}>
              <CardHeader>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-0 hover:bg-transparent"
                  >
                    <CardTitle className="text-base">Low Carbon Fuel Standard (LCFS)</CardTitle>
                    <ChevronDown className={`h-4 w-4 transition-transform ${lcfsOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CardDescription>
                  Available in CA, WA, OR. Enable to include LCFS credit revenue in calculations.
                </CardDescription>
              </CardHeader>
              <CollapsibleContent>
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
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>

        {/* Right Column - Results and Graph */}
        <div className="space-y-6">
          {!mounted ? (
            <Card>
              <CardContent className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading calculator...</p>
              </CardContent>
            </Card>
          ) : results ? (
            <>
              {/* Results Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600 text-lg">Diesel Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fuel Cost per Mile:</span>
                      <span className="font-medium">{formatPerMile(results.diesel.fuelCostPerMile)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Operating Cost per Mile:</span>
                      <span className="font-medium">{formatPerMile(results.diesel.totalOperatingCostPerMile)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Annual Operating Cost:</span>
                      <span className="font-medium">{formatCurrency(results.diesel.annualOperatingCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Net Upfront Cost:</span>
                      <span className="font-medium">{formatCurrency(results.diesel.netUpfrontCost)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t text-sm">
                      <span className="font-medium">10-Year Total Cost:</span>
                      <span className="font-bold">{formatCurrency(results.diesel.yearlyTotalCosts[9])}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600 text-lg">BEV Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fuel Cost per Mile:</span>
                      <span className="font-medium">{formatPerMile(results.bev.fuelCostPerMile)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Operating Cost per Mile:</span>
                      <span className="font-medium">{formatPerMile(results.bev.totalOperatingCostPerMile)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Annual Operating Cost:</span>
                      <span className="font-medium">{formatCurrency(results.bev.annualOperatingCost)}</span>
                    </div>
                    {results.bev.lcfsRevenuePerYear && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>LCFS Revenue per Year:</span>
                        <span className="font-medium">+{formatCurrency(results.bev.lcfsRevenuePerYear)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Net Upfront Cost:</span>
                      <span className="font-medium">{formatCurrency(results.bev.netUpfrontCost)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t text-sm">
                      <span className="font-medium">10-Year Total Cost:</span>
                      <span className="font-bold">{formatCurrency(results.bev.yearlyTotalCosts[9])}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comparison Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    10-Year Cost Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ComparisonChart 
                    dieselCosts={results.diesel.yearlyTotalCosts}
                    bevCosts={results.bev.yearlyTotalCosts}
                  />
                  
                  {/* Cost Savings Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Cost Savings Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>10-Year Savings with BEV:</span>
                        <span className={`font-medium ${results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9] > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9])}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Break-even Year:</span>
                        <span className="font-medium">
                          {(() => {
                            const breakEvenIndex = results.bev.yearlyTotalCosts.findIndex(
                              (cost: number, i: number) => cost < results.diesel.yearlyTotalCosts[i]
                            );
                            return breakEvenIndex === -1 ? 'Beyond 10 years' : `Year ${breakEvenIndex + 1}`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}