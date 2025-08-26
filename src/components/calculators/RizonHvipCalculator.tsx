'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
  Phone,
  Calculator,
  CheckCircle,
  AlertCircle,
  MapPin,
  ExternalLink
} from 'lucide-react';
import {
  BEVCostCalculator as BEVCalculator,
  VehicleInputs,
  LCFSInputs,
  defaultLCFSInputs
} from '@/lib/calculators/bev-cost-calculator';

// HVIP Incentive tiers
const HVIP_INCENTIVES = {
  base: { amount: 60000, label: 'Base HVIP Voucher' },
  smallFleet: { amount: 120000, label: 'Small Fleet Eligible' },
  disadvantagedCommunity: { amount: 138000, label: 'Disadvantaged Community' }
};

// Vehicle data
const DIESEL_TRUCKS = [
  { id: 'isuzu-n-series', name: 'Isuzu N Series', cost: 65000, mpg: 8.5, maintenance: 0.50 },
  { id: 'hino-m5', name: 'Hino M5', cost: 72000, mpg: 7.8, maintenance: 0.55 },
  { id: 'freightliner-m2', name: 'Freightliner M2 Class 6', cost: 85000, mpg: 7.2, maintenance: 0.60 }
];

// Rizon truck data
const RIZON_TRUCK = {
  baseCost: 185000,
  efficiency: 1.8, // kWh/mile
  maintenance: 0.25
};

export default function RizonHvipCalculator() {
  const [mounted, setMounted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [selectedYears, setSelectedYears] = useState(5);
  
  // Vehicle selection
  const [selectedDieselTruck, setSelectedDieselTruck] = useState('isuzu-n-series');
  const [hvipTier, setHvipTier] = useState<'base' | 'smallFleet' | 'disadvantagedCommunity'>('base');
  
  // Driving inputs
  const [annualMiles, setAnnualMiles] = useState(50000);
  const [fuelPrice, setFuelPrice] = useState(4.23);
  const [electricityPrice, setElectricityPrice] = useState(0.14);
  const [vehicleYears, setVehicleYears] = useState(10);
  
  // Prepare inputs
  const selectedDiesel = DIESEL_TRUCKS.find(t => t.id === selectedDieselTruck) || DIESEL_TRUCKS[0];
  const hvipIncentive = HVIP_INCENTIVES[hvipTier].amount;
  
  const dieselInputs: VehicleInputs = useMemo(() => ({
    truckCost: selectedDiesel.cost,
    infrastructureCost: 0,
    truckIncentive: 0,
    infrastructureIncentive: 0,
    residualValue: selectedDiesel.cost * 0.2, // 20% residual
    fuelPrice: fuelPrice,
    efficiency: selectedDiesel.mpg,
    maintenancePerMile: selectedDiesel.maintenance,
    insurancePerMile: 0.15,
    otherPerMile: 0,
    milesPerYear: annualMiles
  }), [selectedDiesel, fuelPrice, annualMiles]);

  const bevInputs: VehicleInputs = useMemo(() => ({
    truckCost: RIZON_TRUCK.baseCost,
    infrastructureCost: 25000, // Charging infrastructure
    truckIncentive: hvipIncentive,
    infrastructureIncentive: 0,
    residualValue: RIZON_TRUCK.baseCost * 0.15, // 15% residual
    fuelPrice: electricityPrice,
    efficiency: RIZON_TRUCK.efficiency,
    maintenancePerMile: RIZON_TRUCK.maintenance,
    insurancePerMile: 0.18,
    otherPerMile: 0,
    milesPerYear: annualMiles
  }), [hvipIncentive, electricityPrice, annualMiles]);

  // LCFS (always enabled for California)
  const lcfsInputs: LCFSInputs = useMemo(() => defaultLCFSInputs, []);

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  };

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calculator...</p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const yearIndex = Math.min(vehicleYears - 1, 9);
  const totalSavings = results.diesel.yearlyTotalCosts[yearIndex] - results.bev.yearlyTotalCosts[yearIndex];
  const annualFuelSavings = (dieselInputs.milesPerYear / dieselInputs.efficiency * dieselInputs.fuelPrice) - 
                           (bevInputs.milesPerYear * bevInputs.efficiency * bevInputs.fuelPrice);
  const annualMaintenanceSavings = (dieselInputs.maintenancePerMile - bevInputs.maintenancePerMile) * annualMiles;
  const co2Reduction = (dieselInputs.milesPerYear / dieselInputs.efficiency * 22.4) / 2000; // tons

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Badge className="bg-yellow-500 text-black mb-4">HVIP Incentives Available</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Save up to $138,000 on a NEW Rizon with HVIP Incentives
          </h1>
          <p className="text-xl md:text-2xl text-blue-100">
            Switch your fleet to zero-emission Rizon Class 4/5 trucks today. 
            Lower operating costs, government incentives, and a cleaner California.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Vehicle Selection */}
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

              {/* Rizon Electric */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Rizon Electric Truck
                  <Zap className="h-5 w-5 text-green-500" />
                </h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Base Price</div>
                  <div className="text-2xl font-bold">{formatCurrency(RIZON_TRUCK.baseCost)}</div>
                  <div className="text-sm text-gray-600 line-through">Before incentives</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(RIZON_TRUCK.baseCost - hvipIncentive)}
                  </div>
                  <div className="text-sm text-gray-600">After HVIP incentive</div>
                  <div className="text-sm text-gray-600 mt-2">{RIZON_TRUCK.efficiency} kWh/mile</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HVIP Incentives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              HVIP Incentive Selection
            </CardTitle>
            <CardDescription>
              Choose your eligible incentive tier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(HVIP_INCENTIVES).map(([key, tier]) => (
                  <label
                    key={key}
                    className={`relative flex cursor-pointer rounded-lg border p-4 ${
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
                      <span className="block text-sm font-medium text-gray-900">
                        {tier.label}
                      </span>
                      <span className="mt-1 flex items-center text-sm text-gray-500">
                        {formatCurrency(tier.amount)} voucher
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Check your eligibility for higher incentive tiers.{' '}
                  <a 
                    href="https://webmaps.arb.ca.gov/PriorityPopulations/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline inline-flex items-center gap-1"
                  >
                    View DAC Map <ExternalLink className="h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Driving Habits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Driving Habits
            </CardTitle>
            <CardDescription>
              Enter your fleet's typical usage patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label htmlFor="annual-miles">Annual Miles Driven</Label>
                <Input
                  id="annual-miles"
                  type="number"
                  value={annualMiles}
                  onChange={(e) => setAnnualMiles(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="fuel-price">Fuel Price ($/gal)</Label>
                <Input
                  id="fuel-price"
                  type="number"
                  step="0.01"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="electricity-price">Electricity Price ($/kWh)</Label>
                <Input
                  id="electricity-price"
                  type="number"
                  step="0.01"
                  value={electricityPrice}
                  onChange={(e) => setElectricityPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="vehicle-years">Vehicle Usage (years)</Label>
                <Input
                  id="vehicle-years"
                  type="number"
                  value={vehicleYears}
                  onChange={(e) => setVehicleYears(Math.min(10, parseInt(e.target.value) || 1))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center">Your Savings Summary</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Annual Fuel Savings */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="pt-6">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Annual Fuel Savings</div>
                  <div className="text-3xl font-bold text-green-700">
                    {formatCurrency(annualFuelSavings)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Savings */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Annual Maintenance Savings</div>
                  <div className="text-3xl font-bold text-blue-700">
                    {formatCurrency(annualMaintenanceSavings)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Operating Savings */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Calculator className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Total {vehicleYears}-Year Savings</div>
                  <div className="text-3xl font-bold text-purple-700">
                    {formatCurrency(totalSavings)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CO2 Reduction */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Leaf className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Annual CO₂ Reduction</div>
                  <div className="text-3xl font-bold text-green-700">
                    {co2Reduction.toFixed(1)} tons
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Cost Component</th>
                      <th className="text-right p-2">{selectedDiesel.name}</th>
                      <th className="text-right p-2">Rizon Electric</th>
                      <th className="text-right p-2">Difference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-2">Vehicle Price</td>
                      <td className="text-right p-2">{formatCurrency(selectedDiesel.cost)}</td>
                      <td className="text-right p-2">{formatCurrency(RIZON_TRUCK.baseCost)}</td>
                      <td className="text-right p-2 text-red-600">
                        +{formatCurrency(RIZON_TRUCK.baseCost - selectedDiesel.cost)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2">HVIP Incentive</td>
                      <td className="text-right p-2">-</td>
                      <td className="text-right p-2 text-green-600">
                        -{formatCurrency(hvipIncentive)}
                      </td>
                      <td className="text-right p-2 text-green-600">
                        -{formatCurrency(hvipIncentive)}
                      </td>
                    </tr>
                    <tr className="font-semibold bg-gray-50">
                      <td className="p-2">Net Purchase Price</td>
                      <td className="text-right p-2">{formatCurrency(selectedDiesel.cost)}</td>
                      <td className="text-right p-2">
                        {formatCurrency(RIZON_TRUCK.baseCost - hvipIncentive + 25000)}
                      </td>
                      <td className="text-right p-2 text-green-600">
                        {formatCurrency((RIZON_TRUCK.baseCost - hvipIncentive + 25000) - selectedDiesel.cost)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2">Annual Fuel Cost</td>
                      <td className="text-right p-2">
                        {formatCurrency(dieselInputs.milesPerYear / dieselInputs.efficiency * dieselInputs.fuelPrice)}
                      </td>
                      <td className="text-right p-2">
                        {formatCurrency(bevInputs.milesPerYear * bevInputs.efficiency * bevInputs.fuelPrice)}
                      </td>
                      <td className="text-right p-2 text-green-600">
                        -{formatCurrency(annualFuelSavings)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2">Annual Maintenance</td>
                      <td className="text-right p-2">
                        {formatCurrency(dieselInputs.maintenancePerMile * annualMiles)}
                      </td>
                      <td className="text-right p-2">
                        {formatCurrency(bevInputs.maintenancePerMile * annualMiles)}
                      </td>
                      <td className="text-right p-2 text-green-600">
                        -{formatCurrency(annualMaintenanceSavings)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How HVIP Works */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">How HVIP Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Speak with a Velocity Incentive Expert</h3>
                <p className="text-gray-600">
                  Guide user through eligibility and max savings
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Reserve Your Voucher</h3>
                <p className="text-gray-600">
                  Velocity Truck Centers handles application to secure funds
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Drive Away with Instant Savings</h3>
                <p className="text-gray-600">
                  Apply HVIP incentive upfront to reduce purchase price
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTAs */}
        <div className="space-y-4">
          <Button className="w-full md:w-auto mx-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
            <Phone className="h-5 w-5" />
            Maximize Your HVIP Savings - Speak to a Specialist Today
          </Button>
          <div className="grid md:grid-cols-2 gap-4">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculate Your Fleet's Incentives Now
            </Button>
            <Button variant="outline" className="w-full flex items-center gap-2 text-orange-600 border-orange-600 hover:bg-orange-50">
              <AlertCircle className="h-5 w-5" />
              Don't Wait - HVIP Funding is Limited, Call Us Today
            </Button>
          </div>
        </div>

        {/* Footer Quote CTA */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="py-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Get Your Rizon EV Quote + Incentive Estimate
            </h3>
            <p className="mb-6 text-blue-100">
              Our experts will calculate your exact savings and help you secure maximum incentives
            </p>
            <Button className="bg-white text-blue-700 hover:bg-gray-100">
              Request Your Custom Quote
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}