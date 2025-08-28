'use client';

import React, { useState, useEffect } from 'react';
import { useCalculator } from '@/components/calculators/shared/use-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { 
  Truck, 
  DollarSign, 
  Settings, 
  BarChart3,
  CheckCircle,
  Clock,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import section components
import VehicleSelectionSection from './components/vehicle-selection-section';
import HvipIncentiveSection from './components/hvip-incentive-section';
import ParametersSection from './components/parameters-section';
import ResultsSection from './components/results-section';

// Section completion tracking
interface SectionState {
  id: string;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
  required: boolean;
  canOpen: boolean;
  description: string;
}

export default function FinalV2Calculator() {
  const {
    dieselInputs,
    bevInputs,
    enableLCFS,
    results,
    updateDieselInput,
    updateBEVInput,
    setEnableLCFS
  } = useCalculator();

  // Section states with progressive unlock logic
  const [sectionStates, setSectionStates] = useState<SectionState[]>([
    { 
      id: 'vehicles', 
      title: 'Select Vehicles to Compare', 
      icon: <Truck className="h-5 w-5" />,
      completed: false, 
      required: true, 
      canOpen: true,
      description: 'Choose diesel and electric truck models'
    },
    { 
      id: 'incentives', 
      title: 'Configure HVIP Incentives', 
      icon: <DollarSign className="h-5 w-5" />,
      completed: false, 
      required: true, 
      canOpen: false,
      description: 'Select your HVIP voucher tier'
    },
    { 
      id: 'parameters', 
      title: 'Fine-tune Parameters', 
      icon: <Settings className="h-5 w-5" />,
      completed: false, 
      required: false, 
      canOpen: false,
      description: 'Adjust costs, efficiency, and usage patterns'
    },
    { 
      id: 'results', 
      title: 'View Results & Analysis', 
      icon: <BarChart3 className="h-5 w-5" />,
      completed: false, 
      required: false, 
      canOpen: false,
      description: 'Compare costs, savings, and break-even analysis'
    }
  ]);

  const [currentSection, setCurrentSection] = useState('vehicles');
  
  // Vehicle selection state (will be passed to sections)
  const [selectedDieselTruck, setSelectedDieselTruck] = useState('isuzu-n-series');
  const [selectedElectricTruck, setSelectedElectricTruck] = useState('rizon-class6-2pack');
  const [hvipTier, setHvipTier] = useState<'base' | 'smallFleet' | 'disadvantagedCommunity'>('base');

  // Check section completion and update unlock status
  useEffect(() => {
    setSectionStates(prevStates => {
      const newStates = [...prevStates];
      
      // Check vehicle selection completion
      const vehicleCompleted = Boolean(selectedDieselTruck && selectedElectricTruck);
      newStates[0].completed = vehicleCompleted;
      
      // Check HVIP selection completion  
      const hvipCompleted = Boolean(hvipTier);
      newStates[1].completed = hvipCompleted;
      newStates[1].canOpen = vehicleCompleted;
      
      // Parameters section (optional, always available after HVIP)
      newStates[2].canOpen = hvipCompleted;
      newStates[2].completed = true; // Always considered complete as it's optional
      
      // Results section (available after required sections)
      newStates[3].canOpen = vehicleCompleted && hvipCompleted;
      newStates[3].completed = Boolean(results);
      
      return newStates;
    });
  }, [selectedDieselTruck, selectedElectricTruck, hvipTier, results]);

  // Calculate overall progress
  const completedSections = sectionStates.filter(s => s.completed).length;
  const totalSections = sectionStates.length;
  const progressPercentage = (completedSections / totalSections) * 100;

  // Section status indicator
  const getSectionStatus = (section: SectionState) => {
    if (section.completed) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (section.canOpen) {
      return <Clock className="h-4 w-4 text-blue-500" />;
    } else {
      return <Lock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Interactive BEV Cost Calculator
          </CardTitle>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Complete each section to build your comparison
              </span>
              <Badge variant="outline">
                {completedSections}/{totalSections} Complete
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Progressive Disclosure Sections */}
      <Accordion 
        type="single" 
        collapsible 
        value={currentSection}
        onValueChange={setCurrentSection}
        className="space-y-4"
      >
        {sectionStates.map((section) => (
          <AccordionItem 
            key={section.id} 
            value={section.canOpen ? section.id : `disabled-${section.id}`}
            className={cn(
              "border rounded-lg",
              section.canOpen ? "border-gray-200" : "border-gray-100 bg-gray-50"
            )}
          >
            <AccordionTrigger 
              className={cn(
                "px-6 py-4 hover:no-underline",
                !section.canOpen && "cursor-not-allowed opacity-50"
              )}
              onClick={(e) => {
                if (!section.canOpen) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <div className="text-left">
                    <div className="font-semibold">{section.title}</div>
                    <div className="text-sm text-gray-500 font-normal">
                      {section.description}
                    </div>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {getSectionStatus(section)}
                  <Badge 
                    variant={section.completed ? "default" : section.canOpen ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {section.completed ? "Complete" : section.canOpen ? "Ready" : "Locked"}
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-6 pb-6">
              {section.id === 'vehicles' && (
                <VehicleSelectionSection
                  selectedDieselTruck={selectedDieselTruck}
                  selectedElectricTruck={selectedElectricTruck}
                  onDieselTruckChange={setSelectedDieselTruck}
                  onElectricTruckChange={setSelectedElectricTruck}
                  onVehicleDataUpdate={(diesel, electric) => {
                    // Update calculator inputs based on vehicle selection
                    updateDieselInput('truckCost', diesel.cost.toString());
                    updateDieselInput('efficiency', diesel.mpg.toString());
                    updateDieselInput('maintenancePerMile', diesel.maintenance.toString());
                    
                    updateBEVInput('truckCost', electric.cost.toString());
                    updateBEVInput('efficiency', electric.efficiency.toString());
                    updateBEVInput('maintenancePerMile', electric.maintenance.toString());
                  }}
                />
              )}
              
              {section.id === 'incentives' && (
                <HvipIncentiveSection
                  selectedTier={hvipTier}
                  onTierChange={setHvipTier}
                  onIncentiveUpdate={(amount) => {
                    updateBEVInput('truckIncentive', amount.toString());
                  }}
                />
              )}
              
              {section.id === 'parameters' && (
                <ParametersSection
                  dieselInputs={dieselInputs}
                  bevInputs={bevInputs}
                  enableLCFS={enableLCFS}
                  updateDieselInput={updateDieselInput}
                  updateBEVInput={updateBEVInput}
                  setEnableLCFS={setEnableLCFS}
                  onResetToDefaults={() => {
                    // Reset to default values - this would need to be implemented
                    // or we could provide a reset function from useCalculator
                    console.log('Reset to defaults');
                  }}
                />
              )}
              
              {section.id === 'results' && (
                <ResultsSection
                  results={results}
                  dieselInputs={dieselInputs}
                  bevInputs={bevInputs}
                  enableLCFS={enableLCFS}
                  selectedDieselTruck={selectedDieselTruck}
                  selectedElectricTruck={selectedElectricTruck}
                  selectedHvipTier={hvipTier}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Quick Summary (always visible when results available) */}
      {results && results.diesel && results.bev && results.diesel.yearlyTotalCosts && results.bev.yearlyTotalCosts && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-semibold text-green-800">
                  Calculation Complete
                </div>
                <div className="text-sm text-green-600">
                  10-year savings: {results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9] > 0 ? 'BEV saves' : 'Diesel costs less'}
                </div>
              </div>
              <div className="text-2xl font-bold text-green-700">
                ${Math.abs(results.diesel.yearlyTotalCosts[9] - results.bev.yearlyTotalCosts[9]).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
    </div>
  );
}