'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, DollarSign, Zap, Info, Calculator, BarChart3, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  BEVCostCalculator as BEVCalculator,
  VehicleInputs,
  LCFSInputs,
  defaultDieselInputs,
  defaultBEVInputs,
  defaultLCFSInputs
} from '@/lib/calculators/bev-cost-calculator';

const states = {
  'CA': { name: 'California', evIncentive: 2000, utilityIncentive: 500, electricityRate: 0.21 },
  'NY': { name: 'New York', evIncentive: 2000, utilityIncentive: 0, electricityRate: 0.16 },
  'TX': { name: 'Texas', evIncentive: 0, utilityIncentive: 0, electricityRate: 0.12 },
  'FL': { name: 'Florida', evIncentive: 0, utilityIncentive: 0, electricityRate: 0.13 },
  'WA': { name: 'Washington', evIncentive: 2500, utilityIncentive: 1000, electricityRate: 0.10 },
  'OR': { name: 'Oregon', evIncentive: 2500, utilityIncentive: 750, electricityRate: 0.11 },
  'CO': { name: 'Colorado', evIncentive: 5000, utilityIncentive: 500, electricityRate: 0.12 }
};

const vehicleClasses = {
  'compact': { name: 'Compact Car', gasCost: 25000, evCost: 32000, mpg: 35, evEfficiency: 0.25 },
  'midsize': { name: 'Midsize Sedan', gasCost: 30000, evCost: 38000, mpg: 32, evEfficiency: 0.27 },
  'suv': { name: 'SUV/Crossover', gasCost: 35000, evCost: 45000, mpg: 28, evEfficiency: 0.30 },
  'truck': { name: 'Pickup Truck', gasCost: 40000, evCost: 60000, mpg: 24, evEfficiency: 0.35 },
  'luxury': { name: 'Luxury Vehicle', gasCost: 50000, evCost: 65000, mpg: 26, evEfficiency: 0.32 }
};

export default function MccacStyleCalculator() {
  const [mounted, setMounted] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // Location and incentive state
  const [selectedState, setSelectedState] = useState('CA');
  const [selectedVehicle, setSelectedVehicle] = useState('midsize');
  const [annualMiles, setAnnualMiles] = useState('15000');
  const [homeCharging] = useState(true);
  
  // Vehicle inputs
  const [dieselInputs, setDieselInputs] = useState<VehicleInputs>({
    ...defaultDieselInputs,
    truckCost: 30000,
    milesPerYear: 15000,
    fuelPrice: 4.25,
    efficiency: 32,
    maintenancePerMile: 0.08
  });
  
  const [bevInputs, setBevInputs] = useState<VehicleInputs>({
    ...defaultBEVInputs,
    truckCost: 38000,
    truckIncentive: 7500, // Federal
    infrastructureCost: 1200,
    milesPerYear: 15000,
    fuelPrice: 0.16,
    efficiency: 0.27,
    maintenancePerMile: 0.04
  });

  const [lcfsInputs] = useState<LCFSInputs>(defaultLCFSInputs);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update inputs based on selections
  useEffect(() => {
    const state = states[selectedState as keyof typeof states];
    const vehicle = vehicleClasses[selectedVehicle as keyof typeof vehicleClasses];
    
    if (state && vehicle) {
      setDieselInputs(prev => ({
        ...prev,
        truckCost: vehicle.gasCost,
        efficiency: vehicle.mpg,
        milesPerYear: parseInt(annualMiles) || 15000
      }));
      
      setBevInputs(prev => ({
        ...prev,
        truckCost: vehicle.evCost,
        efficiency: vehicle.evEfficiency,
        fuelPrice: state.electricityRate,
        milesPerYear: parseInt(annualMiles) || 15000,
        truckIncentive: 7500 + state.evIncentive, // Federal + state
        infrastructureIncentive: state.utilityIncentive,
        infrastructureCost: homeCharging ? 1200 : 0
      }));
    }
  }, [selectedState, selectedVehicle, annualMiles, homeCharging]);

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Chart data preparation
  const yearlyData = results ? Array.from({ length: 10 }, (_, i) => ({
    year: `Year ${i + 1}`,
    gasoline: results.diesel.yearlyTotalCosts[i],
    electric: results.bev.yearlyTotalCosts[i],
    savings: results.diesel.yearlyTotalCosts[i] - results.bev.yearlyTotalCosts[i]
  })) : [];

  const incentiveBreakdown = [
    { name: 'Federal Tax Credit', amount: 7500 },
    { name: `${states[selectedState as keyof typeof states]?.name} Incentive`, amount: states[selectedState as keyof typeof states]?.evIncentive || 0 },
    { name: 'Utility Incentive', amount: states[selectedState as keyof typeof states]?.utilityIncentive || 0 }
  ].filter(item => item.amount > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Government-style Header */}
      <div className="bg-blue-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="h-10 w-10 text-blue-300" />
            <div>
              <h1 className="text-3xl font-bold">Electric Vehicle Incentives Calculator</h1>
              <p className="text-blue-200 text-lg">Official savings calculator with regional incentives and comprehensive analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Regional Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Regional Configuration
            </CardTitle>
            <CardDescription>
              Select your location to see available incentives and local energy rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="state-select">State/Region</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger id="state-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(states).map(([code, state]) => (
                      <SelectItem key={code} value={code}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="vehicle-class">Vehicle Class</Label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger id="vehicle-class">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(vehicleClasses).map(([key, vehicle]) => (
                      <SelectItem key={key} value={key}>
                        {vehicle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="annual-miles">Annual Mileage</Label>
                <Input
                  id="annual-miles"
                  type="number"
                  value={annualMiles}
                  onChange={(e) => setAnnualMiles(e.target.value)}
                  placeholder="15000"
                />
              </div>
            </div>

            {/* Regional Information */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3">Regional Information for {states[selectedState as keyof typeof states]?.name}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Electricity Rate:</span>
                  <span className="ml-1">${states[selectedState as keyof typeof states]?.electricityRate}/kWh</span>
                </div>
                <div>
                  <span className="font-medium">State EV Incentive:</span>
                  <span className="ml-1">{formatCurrency(states[selectedState as keyof typeof states]?.evIncentive || 0)}</span>
                </div>
                <div>
                  <span className="font-medium">Utility Incentive:</span>
                  <span className="ml-1">{formatCurrency(states[selectedState as keyof typeof states]?.utilityIncentive || 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-green-600" />
              Vehicle Comparison
            </CardTitle>
            <CardDescription>
              Side-by-side comparison of your current and electric vehicle options
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left font-semibold">Specification</th>
                      <th className="border border-gray-300 p-3 text-center font-semibold text-orange-600">Gasoline Vehicle</th>
                      <th className="border border-gray-300 p-3 text-center font-semibold text-green-600">Electric Vehicle</th>
                      <th className="border border-gray-300 p-3 text-center font-semibold text-blue-600">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Purchase Price</td>
                      <td className="border border-gray-300 p-3 text-center">{formatCurrency(dieselInputs.truckCost)}</td>
                      <td className="border border-gray-300 p-3 text-center">{formatCurrency(bevInputs.truckCost)}</td>
                      <td className="border border-gray-300 p-3 text-center text-red-600">
                        +{formatCurrency(bevInputs.truckCost - dieselInputs.truckCost)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Total Incentives</td>
                      <td className="border border-gray-300 p-3 text-center">$0</td>
                      <td className="border border-gray-300 p-3 text-center">{formatCurrency(bevInputs.truckIncentive + bevInputs.infrastructureIncentive)}</td>
                      <td className="border border-gray-300 p-3 text-center text-green-600">
                        -{formatCurrency(bevInputs.truckIncentive + bevInputs.infrastructureIncentive)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Net Purchase Price</td>
                      <td className="border border-gray-300 p-3 text-center">{formatCurrency(dieselInputs.truckCost)}</td>
                      <td className="border border-gray-300 p-3 text-center">{formatCurrency(bevInputs.truckCost - bevInputs.truckIncentive)}</td>
                      <td className="border border-gray-300 p-3 text-center">
                        {formatCurrency(bevInputs.truckCost - bevInputs.truckIncentive - dieselInputs.truckCost)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Fuel Cost per Mile</td>
                      <td className="border border-gray-300 p-3 text-center">${results.diesel.fuelCostPerMile.toFixed(3)}</td>
                      <td className="border border-gray-300 p-3 text-center">${results.bev.fuelCostPerMile.toFixed(3)}</td>
                      <td className="border border-gray-300 p-3 text-center text-green-600">
                        -${(results.diesel.fuelCostPerMile - results.bev.fuelCostPerMile).toFixed(3)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Annual Fuel Cost</td>
                      <td className="border border-gray-300 p-3 text-center">{formatCurrency(results.diesel.fuelCostPerMile * dieselInputs.milesPerYear)}</td>
                      <td className="border border-gray-300 p-3 text-center">{formatCurrency(results.bev.fuelCostPerMile * bevInputs.milesPerYear)}</td>
                      <td className="border border-gray-300 p-3 text-center text-green-600">
                        -{formatCurrency((results.diesel.fuelCostPerMile - results.bev.fuelCostPerMile) * dieselInputs.milesPerYear)}
                      </td>
                    </tr>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="border border-gray-300 p-3">10-Year Total Cost</td>
                      <td className="border border-gray-300 p-3 text-center">{formatCurrency(results.diesel.yearlyTotalCosts[9])}</td>
                      <td className="border border-gray-300 p-3 text-center">{formatCurrency(results.bev.yearlyTotalCosts[9])}</td>
                      <td className={`border border-gray-300 p-3 text-center font-bold ${
                        results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9] > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9] > 0 ? '-' : '+'}{formatCurrency(Math.abs(results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9]))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cost Analysis Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                10-Year Cost Analysis
              </CardTitle>
              <CardDescription>
                Cumulative total cost of ownership comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="gasoline" stroke="#f59e0b" strokeWidth={3} name="Gasoline Vehicle" />
                    <Line type="monotone" dataKey="electric" stroke="#10b981" strokeWidth={3} name="Electric Vehicle" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Incentive Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Available Incentives
              </CardTitle>
              <CardDescription>
                Government and utility incentives in your region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incentiveBreakdown.map((incentive, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-green-800">{incentive.name}</h4>
                      <p className="text-sm text-green-600">Available at purchase</p>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold bg-green-100 text-green-800">
                      {formatCurrency(incentive.amount)}
                    </Badge>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-bold text-blue-800">Total Incentives</h4>
                    <p className="text-sm text-blue-600">Reduces upfront cost</p>
                  </div>
                  <Badge className="text-xl font-bold bg-blue-600">
                    {formatCurrency(incentiveBreakdown.reduce((sum, item) => sum + item.amount, 0))}
                  </Badge>
                </div>
              </div>

              {/* Educational Content */}
              <Alert className="mt-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Incentives vary by location, income, and vehicle specifications. 
                  Consult with a tax professional and check current federal and state programs before making your purchase decision.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Educational Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Understanding Electric Vehicle Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <Zap className="h-8 w-8 text-green-600 mb-3" />
                <h4 className="font-semibold text-green-800 mb-2">Energy Independence</h4>
                <p className="text-sm text-green-700">
                  Electric vehicles reduce dependence on imported oil and support local energy production, 
                  contributing to national energy security.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <Shield className="h-8 w-8 text-blue-600 mb-3" />
                <h4 className="font-semibold text-blue-800 mb-2">Environmental Impact</h4>
                <p className="text-sm text-blue-700">
                  EVs produce zero direct emissions and become cleaner as the electrical grid incorporates 
                  more renewable energy sources like solar and wind.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-purple-600 mb-3" />
                <h4 className="font-semibold text-purple-800 mb-2">Economic Benefits</h4>
                <p className="text-sm text-purple-700">
                  Lower operating costs, reduced maintenance requirements, and stable electricity prices 
                  provide long-term financial advantages over gasoline vehicles.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="text-center text-sm text-gray-600 border-t pt-6">
          <p>
            <strong>Disclaimer:</strong> This calculator provides estimates based on current incentives and average costs. 
            Actual results may vary based on individual circumstances, driving patterns, and local conditions. 
            Always verify current incentive programs and consult with qualified professionals before making purchase decisions.
          </p>
        </div>
      </div>
    </div>
  );
}