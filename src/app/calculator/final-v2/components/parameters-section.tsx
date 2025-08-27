'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Fuel, Zap, DollarSign, Settings, RotateCcw } from 'lucide-react';

interface ParametersSectionProps {
  dieselInputs: any;
  bevInputs: any;
  enableLCFS: boolean;
  updateDieselInput: (field: string, value: string) => void;
  updateBEVInput: (field: string, value: string) => void;
  setEnableLCFS: (enable: boolean) => void;
  onResetToDefaults: () => void;
}

export default function ParametersSection({
  dieselInputs,
  bevInputs,
  enableLCFS,
  updateDieselInput,
  updateBEVInput,
  setEnableLCFS,
  onResetToDefaults
}: ParametersSectionProps) {

  return (
    <div className="space-y-6">
      
      {/* Parameters Guide */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="text-sm font-medium text-amber-800 mb-2">
          Fine-tune Your Analysis
        </div>
        <div className="text-sm text-amber-700">
          Adjust these parameters to match your specific operational conditions. 
          The calculator will update results in real-time as you make changes.
        </div>
      </div>

      {/* Parameter Tabs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Parameter Adjustments
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetToDefaults}
            className="text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset to Defaults
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="usage" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="usage">Usage & Fuel</TabsTrigger>
              <TabsTrigger value="costs">Vehicle Costs</TabsTrigger>
              <TabsTrigger value="incentives">Incentives & LCFS</TabsTrigger>
            </TabsList>
            
            {/* Usage & Fuel Tab */}
            <TabsContent value="usage" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Annual Mileage
                    </Label>
                    <Input
                      type="number"
                      value={dieselInputs.milesPerYear}
                      onChange={(e) => {
                        updateDieselInput('milesPerYear', e.target.value);
                        updateBEVInput('milesPerYear', e.target.value);
                      }}
                      placeholder="70000"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Miles driven per year (typically 50,000 - 120,000)
                    </div>
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-red-500" />
                      Diesel Price ($/gallon)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={dieselInputs.fuelPrice}
                      onChange={(e) => updateDieselInput('fuelPrice', e.target.value)}
                      placeholder="4.23"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Current: ${dieselInputs.fuelPrice}/gal
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      Electricity Price ($/kWh)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={bevInputs.fuelPrice}
                      onChange={(e) => updateBEVInput('fuelPrice', e.target.value)}
                      placeholder="0.40"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Current: ${bevInputs.fuelPrice}/kWh
                    </div>
                  </div>
                  
                  <div>
                    <Label>Diesel Efficiency (MPG)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={dieselInputs.efficiency}
                      onChange={(e) => updateDieselInput('efficiency', e.target.value)}
                      placeholder="8.5"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Miles per gallon for selected truck
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Vehicle Costs Tab */}
            <TabsContent value="costs" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Diesel Truck Cost</Label>
                    <Input
                      type="number"
                      value={dieselInputs.truckCost}
                      onChange={(e) => updateDieselInput('truckCost', e.target.value)}
                      placeholder="65000"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Purchase price before any incentives
                    </div>
                  </div>
                  
                  <div>
                    <Label>Diesel Maintenance ($/mile)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={dieselInputs.maintenancePerMile}
                      onChange={(e) => updateDieselInput('maintenancePerMile', e.target.value)}
                      placeholder="0.50"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Maintenance and repair costs per mile
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>BEV Truck Cost</Label>
                    <Input
                      type="number"
                      value={bevInputs.truckCost}
                      onChange={(e) => updateBEVInput('truckCost', e.target.value)}
                      placeholder="145000"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Purchase price before incentives
                    </div>
                  </div>
                  
                  <div>
                    <Label>BEV Maintenance ($/mile)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={bevInputs.maintenancePerMile}
                      onChange={(e) => updateBEVInput('maintenancePerMile', e.target.value)}
                      placeholder="0.20"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Lower maintenance due to fewer moving parts
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Incentives & LCFS Tab */}
            <TabsContent value="incentives" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>BEV Infrastructure Cost</Label>
                    <Input
                      type="number"
                      value={bevInputs.infrastructureCost}
                      onChange={(e) => updateBEVInput('infrastructureCost', e.target.value)}
                      placeholder="0"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Charging infrastructure installation
                    </div>
                  </div>
                  
                  <div>
                    <Label>Infrastructure Incentive</Label>
                    <Input
                      type="number"
                      value={bevInputs.infrastructureIncentive}
                      onChange={(e) => updateBEVInput('infrastructureIncentive', e.target.value)}
                      placeholder="0"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Rebates for charging equipment
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* LCFS Toggle */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        id="enable-lcfs-v2"
                        checked={enableLCFS}
                        onChange={(e) => setEnableLCFS(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="enable-lcfs-v2" className="font-medium">
                        Enable LCFS Revenue
                      </Label>
                    </div>
                    <div className="text-sm text-green-600">
                      Low Carbon Fuel Standard credits for CA, WA, OR operations. 
                      Provides additional revenue for electric vehicle operations.
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium mb-1">Parameter Tips:</div>
                    <ul className="text-xs space-y-1">
                      <li>• Higher mileage favors electric trucks</li>
                      <li>• LCFS can add $2,000-4,000 annual revenue</li>
                      <li>• BEV maintenance is typically 40-60% lower</li>
                      <li>• Consider local electricity rates and time-of-use pricing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
    </div>
  );
}