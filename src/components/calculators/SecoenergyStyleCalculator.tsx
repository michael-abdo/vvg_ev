'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Car, Zap, Clock, Leaf, DollarSign, Wrench, BarChart3, Info } from 'lucide-react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  BEVCostCalculator as BEVCalculator,
  VehicleInputs,
  LCFSInputs,
  defaultDieselInputs,
  defaultBEVInputs,
  defaultLCFSInputs
} from '@/lib/calculators/bev-cost-calculator';


// Vehicle database
const vehicleDatabase = {
  '2024': {
    'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot'],
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius'],
    'Ford': ['F-150', 'Escape', 'Explorer', 'Mustang'],
    'Chevrolet': ['Silverado', 'Equinox', 'Malibu', 'Tahoe'],
    'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X']
  },
  '2023': {
    'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot'],
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius'],
    'Ford': ['F-150', 'Escape', 'Explorer', 'Mustang'],
    'Chevrolet': ['Silverado', 'Equinox', 'Malibu', 'Tahoe']
  },
  '2022': {
    'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot'],
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander'],
    'Ford': ['F-150', 'Escape', 'Explorer'],
    'Chevrolet': ['Silverado', 'Equinox', 'Malibu']
  }
};

const chargingLevels = {
  'level1': { name: 'Level 1 (120V)', power: 1.4, cost: 0 },
  'level2': { name: 'Level 2 (240V)', power: 7.2, cost: 1200 },
  'dcfast': { name: 'DC Fast Charging', power: 50, cost: 0 }
};

export default function SecoenergyStyleCalculator() {
  const [mounted, setMounted] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // Vehicle selection
  const [gasYear, setGasYear] = useState('2024');
  const [gasBrand, setGasBrand] = useState('Toyota');
  const [gasModel, setGasModel] = useState('Camry');
  const [evYear, setEvYear] = useState('2024');
  const [evBrand, setEvBrand] = useState('Tesla');
  const [evModel, setEvModel] = useState('Model 3');
  const [evType, setEvType] = useState('BEV');
  
  // Usage patterns
  const [roundTripMiles, setRoundTripMiles] = useState('40');
  const [weekdayDriving, setWeekdayDriving] = useState('5');
  const [weekendMiles, setWeekendMiles] = useState('30');
  
  // Pricing
  const [fuelPrice, setFuelPrice] = useState('4.25');
  const [estimatedMPG, setEstimatedMPG] = useState('28');
  const [electricityRate, setElectricityRate] = useState('0.15');
  const [chargingLevel, setChargingLevel] = useState('level2');
  
  // Vehicle inputs
  const [dieselInputs, setDieselInputs] = useState<VehicleInputs>({
    ...defaultDieselInputs,
    truckCost: 32000,
    milesPerYear: 15000,
    fuelPrice: 4.25,
    efficiency: 28,
    maintenancePerMile: 0.08
  });
  
  const [bevInputs, setBevInputs] = useState<VehicleInputs>({
    ...defaultBEVInputs,
    truckCost: 45000,
    truckIncentive: 7500,
    infrastructureCost: 1200,
    milesPerYear: 15000,
    fuelPrice: 0.15,
    efficiency: 0.28,
    maintenancePerMile: 0.04
  });

  const [lcfsInputs] = useState<LCFSInputs>(defaultLCFSInputs);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate annual mileage from patterns
  useEffect(() => {
    const weekdayMiles = parseFloat(roundTripMiles) * parseFloat(weekdayDriving) * 52;
    const weekendMilesAnnual = parseFloat(weekendMiles) * 52;
    const totalMiles = weekdayMiles + weekendMilesAnnual;
    
    setDieselInputs(prev => ({
      ...prev,
      milesPerYear: totalMiles,
      fuelPrice: parseFloat(fuelPrice),
      efficiency: parseFloat(estimatedMPG)
    }));
    
    setBevInputs(prev => ({
      ...prev,
      milesPerYear: totalMiles,
      fuelPrice: parseFloat(electricityRate),
      infrastructureCost: chargingLevels[chargingLevel as keyof typeof chargingLevels]?.cost || 0
    }));
  }, [roundTripMiles, weekdayDriving, weekendMiles, fuelPrice, estimatedMPG, electricityRate, chargingLevel]);

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

  // Calculate charging time
  const batteryCapacity = 75; // kWh - typical EV battery
  const chargingPower = chargingLevels[chargingLevel as keyof typeof chargingLevels]?.power || 7.2;
  const chargingTime = batteryCapacity / chargingPower;

  // Chart data
  const yearlyComparisonData = results ? Array.from({ length: 10 }, (_, i) => ({
    year: i + 1,
    gasTotal: results.diesel.yearlyTotalCosts[i],
    evTotal: results.bev.yearlyTotalCosts[i],
    gasFuel: results.diesel.fuelCostPerMile * dieselInputs.milesPerYear * (i + 1),
    evFuel: results.bev.fuelCostPerMile * bevInputs.milesPerYear * (i + 1)
  })) : [];

  const costBreakdownData = results ? [
    { name: 'Initial Cost', gas: dieselInputs.truckCost, ev: bevInputs.truckCost - bevInputs.truckIncentive },
    { name: '10-Year Fuel', gas: results.diesel.fuelCostPerMile * dieselInputs.milesPerYear * 10, ev: results.bev.fuelCostPerMile * bevInputs.milesPerYear * 10 },
    { name: '10-Year Maintenance', gas: dieselInputs.maintenancePerMile * dieselInputs.milesPerYear * 10, ev: bevInputs.maintenancePerMile * bevInputs.milesPerYear * 10 },
    { name: 'Infrastructure', gas: 0, ev: bevInputs.infrastructureCost }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Utility-Style Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <Zap className="h-10 w-10 text-blue-200" />
            <div>
              <h1 className="text-4xl font-bold">Comprehensive EV Savings Calculator</h1>
              <p className="text-blue-100 text-xl">Detailed analysis with charging scenarios and maintenance comparisons</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="vehicles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="vehicles">Vehicle Selection</TabsTrigger>
            <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
            <TabsTrigger value="pricing">Energy Pricing</TabsTrigger>
            <TabsTrigger value="charging">Charging Analysis</TabsTrigger>
            <TabsTrigger value="results">Complete Results</TabsTrigger>
          </TabsList>

          {/* Vehicle Selection Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gas Vehicle Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <Car className="h-5 w-5" />
                    Current Gasoline Vehicle
                  </CardTitle>
                  <CardDescription>Select your current vehicle specifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="gas-year">Year</Label>
                      <Select value={gasYear} onValueChange={setGasYear}>
                        <SelectTrigger id="gas-year">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(vehicleDatabase).map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="gas-brand">Brand</Label>
                      <Select value={gasBrand} onValueChange={setGasBrand}>
                        <SelectTrigger id="gas-brand">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys((vehicleDatabase as any)[gasYear] || {}).map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="gas-model">Model</Label>
                      <Select value={gasModel} onValueChange={setGasModel}>
                        <SelectTrigger id="gas-model">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {((vehicleDatabase as any)[gasYear]?.[gasBrand] || []).map((model: string) => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Selected Vehicle</h4>
                    <p className="text-orange-700">{gasYear} {gasBrand} {gasModel}</p>
                  </div>
                </CardContent>
              </Card>

              {/* EV Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Zap className="h-5 w-5" />
                    Electric Vehicle Option
                  </CardTitle>
                  <CardDescription>Choose your preferred electric vehicle</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="ev-year">Year</Label>
                      <Select value={evYear} onValueChange={setEvYear}>
                        <SelectTrigger id="ev-year">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(vehicleDatabase).map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="ev-brand">Brand</Label>
                      <Select value={evBrand} onValueChange={setEvBrand}>
                        <SelectTrigger id="ev-brand">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys((vehicleDatabase as any)[evYear] || {}).map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="ev-model">Model</Label>
                      <Select value={evModel} onValueChange={setEvModel}>
                        <SelectTrigger id="ev-model">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {((vehicleDatabase as any)[evYear]?.[evBrand] || []).map((model: string) => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="ev-type">Vehicle Type</Label>
                    <Select value={evType} onValueChange={setEvType}>
                      <SelectTrigger id="ev-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEV">Battery Electric (BEV)</SelectItem>
                        <SelectItem value="PHEV">Plug-in Hybrid (PHEV)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Selected Vehicle</h4>
                    <p className="text-green-700">{evYear} {evBrand} {evModel}</p>
                    <Badge variant="secondary" className="mt-1">{evType}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usage Patterns Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Driving Patterns
                </CardTitle>
                <CardDescription>
                  Configure your typical driving habits for accurate calculations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="round-trip">Round Trip Commute (miles)</Label>
                    <Input
                      id="round-trip"
                      type="number"
                      value={roundTripMiles}
                      onChange={(e) => setRoundTripMiles(e.target.value)}
                      placeholder="40"
                    />
                    <p className="text-sm text-gray-500 mt-1">Daily work commute</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="weekday-driving">Weekday Driving (days/week)</Label>
                    <Input
                      id="weekday-driving"
                      type="number"
                      max="7"
                      value={weekdayDriving}
                      onChange={(e) => setWeekdayDriving(e.target.value)}
                      placeholder="5"
                    />
                    <p className="text-sm text-gray-500 mt-1">Work days per week</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="weekend-miles">Weekend Miles</Label>
                    <Input
                      id="weekend-miles"
                      type="number"
                      value={weekendMiles}
                      onChange={(e) => setWeekendMiles(e.target.value)}
                      placeholder="30"
                    />
                    <p className="text-sm text-gray-500 mt-1">Miles per weekend</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Calculated Annual Mileage</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Weekday Miles:</span>
                      <span className="ml-1">{(parseFloat(roundTripMiles) * parseFloat(weekdayDriving) * 52).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">Weekend Miles:</span>
                      <span className="ml-1">{(parseFloat(weekendMiles) * 52).toLocaleString()}</span>
                    </div>
                    <div className="font-semibold">
                      <span>Total Annual:</span>
                      <span className="ml-1">{(parseFloat(roundTripMiles) * parseFloat(weekdayDriving) * 52 + parseFloat(weekendMiles) * 52).toLocaleString()} miles</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Configuration Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <DollarSign className="h-5 w-5" />
                    Gasoline Costs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fuel-price">Fuel Price ($/gallon)</Label>
                    <Input
                      id="fuel-price"
                      type="number"
                      step="0.01"
                      value={fuelPrice}
                      onChange={(e) => setFuelPrice(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="estimated-mpg">Estimated Vehicle MPG</Label>
                    <Input
                      id="estimated-mpg"
                      type="number"
                      step="0.1"
                      value={estimatedMPG}
                      onChange={(e) => setEstimatedMPG(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Zap className="h-5 w-5" />
                    Electricity Costs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="electricity-rate">Electricity Rate ($/kWh)</Label>
                    <Input
                      id="electricity-rate"
                      type="number"
                      step="0.01"
                      value={electricityRate}
                      onChange={(e) => setElectricityRate(e.target.value)}
                    />
                    <p className="text-sm text-gray-500 mt-1">Check your utility bill</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="charging-level">Charging Level</Label>
                    <Select value={chargingLevel} onValueChange={setChargingLevel}>
                      <SelectTrigger id="charging-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(chargingLevels).map(([key, level]) => (
                          <SelectItem key={key} value={key}>{level.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Charging Analysis Tab */}
          <TabsContent value="charging" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Charging Time Analysis
                  </CardTitle>
                  <CardDescription>
                    Estimated charging times for {chargingLevels[chargingLevel as keyof typeof chargingLevels]?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">0-80% Charge Time:</span>
                      <Badge variant="secondary">{(chargingTime * 0.8).toFixed(1)} hours</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Daily Top-up Time:</span>
                      <Badge variant="secondary">
                        {((parseFloat(roundTripMiles) * 0.3) / chargingPower).toFixed(1)} hours
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">Weekly Charging Cost:</span>
                      <Badge variant="secondary">
                        {formatCurrency(parseFloat(roundTripMiles) * parseFloat(weekdayDriving) * 0.3 * parseFloat(electricityRate))}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h4 className="font-semibold mb-3">Charging Infrastructure Cost</h4>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{chargingLevels[chargingLevel as keyof typeof chargingLevels]?.name}</p>
                        <p className="text-sm text-gray-600">Installation and equipment</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {formatCurrency(chargingLevels[chargingLevel as keyof typeof chargingLevels]?.cost || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-purple-600" />
                    Maintenance Comparison
                  </CardTitle>
                  <CardDescription>
                    Annual maintenance cost differences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {results && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <div>
                          <p className="font-medium">Gasoline Vehicle</p>
                          <p className="text-sm text-gray-600">Oil changes, filters, etc.</p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800">
                          {formatCurrency(dieselInputs.maintenancePerMile * dieselInputs.milesPerYear)}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium">Electric Vehicle</p>
                          <p className="text-sm text-gray-600">Minimal maintenance</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {formatCurrency(bevInputs.maintenancePerMile * bevInputs.milesPerYear)}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg font-semibold">
                        <span>Annual Maintenance Savings:</span>
                        <Badge className="bg-blue-600">
                          {formatCurrency((dieselInputs.maintenancePerMile - bevInputs.maintenancePerMile) * dieselInputs.milesPerYear)}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Complete Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {results && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {formatCurrency(results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9])}
                      </div>
                      <div className="text-sm text-gray-600">10-Year Savings</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {formatCurrency((results.diesel.annualOperatingCost - results.bev.annualOperatingCost))}
                      </div>
                      <div className="text-sm text-gray-600">Annual Savings</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        ${(results.diesel.fuelCostPerMile - results.bev.fuelCostPerMile).toFixed(3)}
                      </div>
                      <div className="text-sm text-gray-600">Savings per Mile</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {(() => {
                          const breakEvenIndex = results.bev.yearlyTotalCosts.findIndex(
                            (cost: number, i: number) => cost < results.diesel.yearlyTotalCosts[i]
                          );
                          return breakEvenIndex === -1 ? '10+' : (breakEvenIndex + 1);
                        })()}
                      </div>
                      <div className="text-sm text-gray-600">Break-even (Years)</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Comprehensive Analysis Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>10-Year Cost Progression</CardTitle>
                      <CardDescription>Total cost of ownership over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={yearlyComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="gasTotal" fill="#f59e0b" name="Gas Total Cost" />
                            <Bar dataKey="evTotal" fill="#10b981" name="EV Total Cost" />
                            <Line type="monotone" dataKey="gasFuel" stroke="#dc2626" name="Gas Fuel Only" strokeWidth={2} />
                            <Line type="monotone" dataKey="evFuel" stroke="#059669" name="EV Energy Only" strokeWidth={2} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Breakdown Analysis</CardTitle>
                      <CardDescription>Component cost comparison</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={costBreakdownData} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="gas" fill="#f59e0b" name="Gasoline" />
                            <Bar dataKey="ev" fill="#10b981" name="Electric" />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Environmental Impact */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-600" />
                      Environmental Impact
                    </CardTitle>
                    <CardDescription>
                      Carbon reduction and environmental benefits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {((dieselInputs.milesPerYear / dieselInputs.efficiency) * 19.6 * 10 / 2000).toFixed(1)}
                        </div>
                        <div className="text-sm text-green-700">Tons CO₂ Avoided (10 years)</div>
                      </div>
                      
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {(dieselInputs.milesPerYear / dieselInputs.efficiency * 10).toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-700">Gallons of Gas Saved</div>
                      </div>
                      
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {(bevInputs.milesPerYear * bevInputs.efficiency * 10).toLocaleString()}
                        </div>
                        <div className="text-sm text-purple-700">kWh Used (10 years)</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Assumptions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-600" />
                      Calculation Assumptions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <h4 className="font-semibold mb-2">Gasoline Vehicle</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li>• Vehicle Cost: {formatCurrency(dieselInputs.truckCost)}</li>
                          <li>• Fuel Efficiency: {dieselInputs.efficiency} MPG</li>
                          <li>• Maintenance: ${dieselInputs.maintenancePerMile.toFixed(3)}/mile</li>
                          <li>• Annual Mileage: {dieselInputs.milesPerYear.toLocaleString()}</li>
                          <li>• Fuel Price: ${dieselInputs.fuelPrice.toFixed(2)}/gallon</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Electric Vehicle</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li>• Vehicle Cost: {formatCurrency(bevInputs.truckCost)}</li>
                          <li>• Efficiency: {bevInputs.efficiency.toFixed(2)} kWh/mile</li>
                          <li>• Maintenance: ${bevInputs.maintenancePerMile.toFixed(3)}/mile</li>
                          <li>• Incentives: {formatCurrency(bevInputs.truckIncentive)}</li>
                          <li>• Electricity Rate: ${bevInputs.fuelPrice.toFixed(3)}/kWh</li>
                          <li>• Infrastructure: {formatCurrency(bevInputs.infrastructureCost)}</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}