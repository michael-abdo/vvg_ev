'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/components/calculators/shared/formatters';
import { Truck, Zap } from 'lucide-react';

// Vehicle data (extracted from original final calculator)
const DIESEL_TRUCKS = [
  { id: 'isuzu-n-series', name: 'Isuzu N Series', cost: 65000, mpg: 8.5, maintenance: 0.50 },
  { id: 'hino-m5', name: 'Hino M5', cost: 72000, mpg: 7.8, maintenance: 0.55 },
  { id: 'freightliner-m2', name: 'Freightliner M2 Class 6', cost: 85000, mpg: 7.2, maintenance: 0.60 }
];

const ELECTRIC_TRUCKS = [
  { 
    id: 'rizon-class6-2pack', 
    name: 'Rizon Class 6 - 2 Battery Pack (15,995 lb GVWR)', 
    cost: 145000, 
    efficiency: 0.85,
    maintenance: 0.20,
    specs: '82/74 kWh usable, 75-110 mi range'
  },
  { 
    id: 'rizon-class6-3pack', 
    name: 'Rizon Class 6 - 3 Battery Pack (15,995 lb GVWR)', 
    cost: 175000, 
    efficiency: 0.87,
    maintenance: 0.20,
    specs: '124/116 kWh usable, 115-160 mi range'
  },
  { 
    id: 'rizon-class7-2pack', 
    name: 'Rizon Class 7 - 2 Battery Pack (17,995 lb GVWR)', 
    cost: 155000, 
    efficiency: 0.95,
    maintenance: 0.22,
    specs: '82/74 kWh usable, 70-105 mi range'
  },
  { 
    id: 'rizon-class7-3pack', 
    name: 'Rizon Class 7 - 3 Battery Pack (17,995 lb GVWR)', 
    cost: 185000, 
    efficiency: 0.97,
    maintenance: 0.22,
    specs: '124/116 kWh usable, 110-155 mi range'
  },
  { 
    id: 'rizon-class7max-2pack', 
    name: 'Rizon Class 7 Max - 2 Battery Pack (18,850 lb GVWR)', 
    cost: 165000, 
    efficiency: 1.0,
    maintenance: 0.24,
    specs: '82/74 kWh usable, 65-100 mi range'
  },
  { 
    id: 'rizon-class7max-3pack', 
    name: 'Rizon Class 7 Max - 3 Battery Pack (18,850 lb GVWR)', 
    cost: 195000, 
    efficiency: 1.02,
    maintenance: 0.24,
    specs: '124/116 kWh usable, 105-150 mi range'
  }
];

interface VehicleSelectionSectionProps {
  selectedDieselTruck: string;
  selectedElectricTruck: string;
  onDieselTruckChange: (value: string) => void;
  onElectricTruckChange: (value: string) => void;
  onVehicleDataUpdate: (dieselTruck: any, electricTruck: any) => void;
}

export default function VehicleSelectionSection({
  selectedDieselTruck,
  selectedElectricTruck,
  onDieselTruckChange,
  onElectricTruckChange,
  onVehicleDataUpdate
}: VehicleSelectionSectionProps) {
  
  const selectedDiesel = DIESEL_TRUCKS.find(t => t.id === selectedDieselTruck) || DIESEL_TRUCKS[0];
  const selectedElectric = ELECTRIC_TRUCKS.find(t => t.id === selectedElectricTruck) || ELECTRIC_TRUCKS[0];
  
  // Update vehicle data when selection changes
  React.useEffect(() => {
    onVehicleDataUpdate(selectedDiesel, selectedElectric);
  }, [selectedDiesel, selectedElectric, onVehicleDataUpdate]);

  const handleDieselChange = (value: string) => {
    onDieselTruckChange(value);
  };

  const handleElectricChange = (value: string) => {
    onElectricTruckChange(value);
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Selection Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm font-medium text-blue-800 mb-2">
          Choose Your Comparison
        </div>
        <div className="text-sm text-blue-600">
          Select a diesel truck to compare against a Rizon electric truck. 
          We&apos;ll calculate 10-year total cost of ownership including fuel, maintenance, and incentives.
        </div>
      </div>

      {/* Vehicle Selection Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Diesel Selection */}
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Truck className="h-5 w-5" />
              Diesel Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <Select value={selectedDieselTruck} onValueChange={handleDieselChange}>
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
            
            <div className="bg-red-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Base Price</span>
                <span className="font-bold text-red-600">{formatCurrency(selectedDiesel.cost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fuel Efficiency</span>
                <span className="font-medium">{selectedDiesel.mpg} MPG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Maintenance</span>
                <span className="font-medium">${selectedDiesel.maintenance}/mile</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Electric Truck Selection */}
        <Card className="border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Zap className="h-5 w-5" />
              Electric Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <Select value={selectedElectricTruck} onValueChange={handleElectricChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ELECTRIC_TRUCKS.map(truck => (
                  <SelectItem key={truck.id} value={truck.id}>
                    {truck.name} - {formatCurrency(truck.cost)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Base Price</span>
                <span className="font-bold text-green-600">{formatCurrency(selectedElectric.cost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Energy Efficiency</span>
                <span className="font-medium">{selectedElectric.efficiency} kWh/mile</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Maintenance</span>
                <span className="font-medium">${selectedElectric.maintenance}/mile</span>
              </div>
              <div className="text-xs text-gray-500 pt-2 border-t">
                {selectedElectric.specs}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Preview */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Selected Comparison
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-red-600">{selectedDiesel.name}</div>
            <div className="text-gray-500">{formatCurrency(selectedDiesel.cost)} • {selectedDiesel.mpg} MPG</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-green-600">{selectedElectric.name}</div>
            <div className="text-gray-500">{formatCurrency(selectedElectric.cost)} • {selectedElectric.efficiency} kWh/mi</div>
          </div>
        </div>
      </div>
      
    </div>
  );
}