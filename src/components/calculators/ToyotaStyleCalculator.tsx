'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Car, Zap, DollarSign, CheckCircle2, Leaf } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import {
  BEVCostCalculator as BEVCalculator,
  VehicleInputs,
  LCFSInputs,
  defaultDieselInputs,
  defaultBEVInputs,
  defaultLCFSInputs
} from '@/lib/calculators/bev-cost-calculator';

const COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b'];

export default function ToyotaStyleCalculator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // Consumer-friendly inputs
  const [selectedVehicleType, setSelectedVehicleType] = useState('midsize-suv');
  const [currentVehicle, setCurrentVehicle] = useState('');
  const [dailyMiles, setDailyMiles] = useState([40]);
  const [gasPrice, setGasPrice] = useState([4.25]);
  const [electricityPrice, setElectricityPrice] = useState([0.15]);
  const [homeCharging, setHomeCharging] = useState('yes');
  const [governmentIncentives, setGovernmentIncentives] = useState('yes');
  
  // Vehicle inputs with consumer defaults
  const [dieselInputs, setDieselInputs] = useState<VehicleInputs>({
    ...defaultDieselInputs,
    truckCost: 35000,
    milesPerYear: 15000,
    fuelPrice: 4.25,
    efficiency: 28,
    maintenancePerMile: 0.08
  });
  
  const [bevInputs, setBevInputs] = useState<VehicleInputs>({
    ...defaultBEVInputs,
    truckCost: 42000,
    infrastructureCost: 1200, // Home charger
    truckIncentive: 7500, // Federal tax credit
    milesPerYear: 15000,
    fuelPrice: 0.15,
    efficiency: 0.28, // kWh/mile equivalent
    maintenancePerMile: 0.04
  });

  const [lcfsInputs, setLcfsInputs] = useState<LCFSInputs>(defaultLCFSInputs);

  const steps = [
    { title: 'Your Current Vehicle', icon: Car },
    { title: 'Driving Habits', icon: Zap },
    { title: 'Energy Costs', icon: DollarSign },
    { title: 'Your Savings', icon: CheckCircle2 }
  ];

  const vehicleTypes = {
    'compact-car': { name: 'Compact Car', cost: 28000, mpg: 32, evCost: 35000, evEfficiency: 0.24 },
    'midsize-sedan': { name: 'Midsize Sedan', cost: 32000, mpg: 30, evCost: 38000, evEfficiency: 0.26 },
    'midsize-suv': { name: 'Midsize SUV', cost: 35000, mpg: 28, evCost: 42000, evEfficiency: 0.28 },
    'full-size-suv': { name: 'Full-size SUV', cost: 45000, mpg: 24, evCost: 55000, evEfficiency: 0.32 },
    'pickup-truck': { name: 'Pickup Truck', cost: 40000, mpg: 22, evCost: 60000, evEfficiency: 0.35 }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const vehicle = vehicleTypes[selectedVehicleType as keyof typeof vehicleTypes];
    if (vehicle) {
      setDieselInputs(prev => ({
        ...prev,
        truckCost: vehicle.cost,
        efficiency: vehicle.mpg,
        fuelPrice: gasPrice[0],
        milesPerYear: dailyMiles[0] * 365
      }));
      
      setBevInputs(prev => ({
        ...prev,
        truckCost: vehicle.evCost,
        efficiency: vehicle.evEfficiency,
        fuelPrice: electricityPrice[0],
        milesPerYear: dailyMiles[0] * 365,
        truckIncentive: governmentIncentives === 'yes' ? 7500 : 0,
        infrastructureCost: homeCharging === 'yes' ? 1200 : 0
      }));
    }
  }, [selectedVehicleType, dailyMiles, gasPrice, electricityPrice, homeCharging, governmentIncentives]);

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

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  // Prepare savings data for charts
  const savingsData = results ? [
    { name: 'Gas Vehicle', value: results.diesel.yearlyTotalCosts[9], color: COLORS[0] },
    { name: 'Electric Vehicle', value: results.bev.yearlyTotalCosts[9], color: COLORS[1] }
  ] : [];

  const annualSavingsData = results ? Array.from({ length: 10 }, (_, i) => ({
    year: `Year ${i + 1}`,
    gasSavings: results.diesel.yearlyTotalCosts[i] - results.bev.yearlyTotalCosts[i],
    cumulative: Array.from({ length: i + 1 }).reduce((sum, _, j) => 
      sum + (results.diesel.yearlyTotalCosts[j] - results.bev.yearlyTotalCosts[j]), 0
    )
  })) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50">
      {/* Header with Progress */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Electric Vehicle Savings Calculator</h1>
              <p className="text-gray-600">Discover your potential savings in just a few simple steps</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Step {currentStep + 1} of {steps.length}</div>
              <Progress value={progress} className="w-32" />
            </div>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                    isActive ? 'bg-red-100 text-red-700' : 
                    isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Step 1: Current Vehicle */}
        {currentStep === 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">What type of vehicle do you currently drive?</CardTitle>
              <CardDescription className="text-lg">
                Help us understand your current vehicle so we can show you comparable electric options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(vehicleTypes).map(([key, vehicle]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedVehicleType(key)}
                    className={`p-6 rounded-lg border-2 transition-all hover:shadow-md ${
                      selectedVehicleType === key
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                        <p className="text-gray-600">~{vehicle.mpg} MPG</p>
                        <p className="text-sm text-gray-500">Starting at {formatCurrency(vehicle.cost)}</p>
                      </div>
                      <Car className="h-8 w-8 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-8">
                <Label htmlFor="current-vehicle" className="text-lg">What specific vehicle do you drive? (Optional)</Label>
                <Input
                  id="current-vehicle"
                  value={currentVehicle}
                  onChange={(e) => setCurrentVehicle(e.target.value)}
                  placeholder="e.g., 2020 Toyota Camry, 2019 Honda CR-V"
                  className="mt-2 text-lg py-6"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Driving Habits */}
        {currentStep === 1 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">Tell us about your driving habits</CardTitle>
              <CardDescription className="text-lg">
                This helps us calculate your potential fuel savings more accurately
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <Label className="text-lg font-medium">How many miles do you drive per day?</Label>
                <div className="mt-4">
                  <Slider
                    value={dailyMiles}
                    onValueChange={setDailyMiles}
                    max={150}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>10 miles</span>
                    <span className="font-medium text-lg text-red-600">{dailyMiles[0]} miles per day</span>
                    <span>150+ miles</span>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-gray-600">That's about {(dailyMiles[0] * 365 / 1000).toFixed(1)}k miles per year</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-lg font-medium">Do you have a garage or dedicated parking spot?</Label>
                  <Select value={homeCharging} onValueChange={setHomeCharging}>
                    <SelectTrigger className="mt-2 text-lg py-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes, I can install a home charger</SelectItem>
                      <SelectItem value="no">No, I'll use public charging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-lg font-medium">Are you eligible for government incentives?</Label>
                  <Select value={governmentIncentives} onValueChange={setGovernmentIncentives}>
                    <SelectTrigger className="mt-2 text-lg py-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes, I qualify for incentives</SelectItem>
                      <SelectItem value="no">No, or not sure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Energy Costs */}
        {currentStep === 2 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">What do you pay for energy?</CardTitle>
              <CardDescription className="text-lg">
                Local energy prices help us calculate your exact savings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <Label className="text-lg font-medium">Current gas price (per gallon)</Label>
                <div className="mt-4">
                  <Slider
                    value={gasPrice}
                    onValueChange={setGasPrice}
                    max={6.00}
                    min={2.50}
                    step={0.05}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>$2.50</span>
                    <span className="font-medium text-lg text-red-600">${gasPrice[0].toFixed(2)} per gallon</span>
                    <span>$6.00+</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-lg font-medium">Your electricity rate (per kWh)</Label>
                <div className="mt-4">
                  <Slider
                    value={electricityPrice}
                    onValueChange={setElectricityPrice}
                    max={0.35}
                    min={0.08}
                    step={0.01}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>$0.08</span>
                    <span className="font-medium text-lg text-green-600">${electricityPrice[0].toFixed(2)} per kWh</span>
                    <span>$0.35+</span>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-gray-600">Check your electric bill for your exact rate</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Leaf className="h-6 w-6 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Environmental Impact</h3>
                </div>
                <p className="text-blue-700">
                  Beyond savings, you'll also reduce your carbon footprint significantly. 
                  Electric vehicles produce zero direct emissions and become cleaner as the grid gets greener.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Results */}
        {currentStep === 3 && results && (
          <div className="space-y-6">
            {/* Hero Savings Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              <CardContent className="p-8 text-center">
                <h2 className="text-3xl font-bold mb-2">Your 10-Year Savings</h2>
                <div className="text-6xl font-bold mb-4">
                  {formatCurrency(results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9])}
                </div>
                <p className="text-xl text-green-100">
                  That's {formatCurrency((results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9]) / 10)} per year in savings!
                </p>
              </CardContent>
            </Card>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Comparison</CardTitle>
                  <CardDescription>Total cost of ownership over 10 years</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={savingsData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {savingsData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Annual Savings</CardTitle>
                  <CardDescription>How your savings accumulate over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={annualSavingsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="cumulative" fill="#22c55e" name="Cumulative Savings" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Facts */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {formatCurrency(results.diesel.annualOperatingCost - results.bev.annualOperatingCost)}
                  </div>
                  <div className="text-sm text-gray-600">Annual Fuel Savings</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {(() => {
                      const breakEvenIndex = results.bev.yearlyTotalCosts.findIndex(
                        (cost: number, i: number) => cost < results.diesel.yearlyTotalCosts[i]
                      );
                      return breakEvenIndex === -1 ? '10+' : breakEvenIndex + 1;
                    })()}
                  </div>
                  <div className="text-sm text-gray-600">Break-even (Years)</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {governmentIncentives === 'yes' ? formatCurrency(7500) : '$0'}
                  </div>
                  <div className="text-sm text-gray-600">Tax Incentives</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    ${(results.diesel.fuelCostPerMile - results.bev.fuelCostPerMile).toFixed(3)}
                  </div>
                  <div className="text-sm text-gray-600">Savings per Mile</div>
                </CardContent>
              </Card>
            </div>

            {/* Next Steps */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-blue-800 mb-4">Ready to make the switch?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold">Research Models</h4>
                    <p className="text-sm text-gray-600">Compare electric versions of your preferred vehicle type</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold">Plan Charging</h4>
                    <p className="text-sm text-gray-600">Set up home charging or find nearby public stations</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold">Apply for Incentives</h4>
                    <p className="text-sm text-gray-600">Take advantage of federal and local tax credits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700"
            >
              Next Step
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentStep(0)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700"
            >
              Start Over
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}