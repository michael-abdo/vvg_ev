'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BEVCostCalculator,
  VehicleInputs,
  LCFSInputs,
  defaultDieselInputs,
  defaultBEVInputs,
  defaultLCFSInputs,
  CalculatorResults
} from '@/lib/calculators/bev-cost-calculator';

export interface UseCalculatorReturn {
  dieselInputs: VehicleInputs;
  bevInputs: VehicleInputs;
  lcfsInputs: LCFSInputs;
  enableLCFS: boolean;
  results: { diesel: CalculatorResults; bev: CalculatorResults } | null;
  updateDieselInput: (field: keyof VehicleInputs, value: string) => void;
  updateBEVInput: (field: keyof VehicleInputs, value: string) => void;
  updateLCFSInput: (field: keyof LCFSInputs, value: string) => void;
  setEnableLCFS: (enable: boolean) => void;
  reset: () => void;
}

export function useCalculator(): UseCalculatorReturn {
  const [dieselInputs, setDieselInputs] = useState<VehicleInputs>(defaultDieselInputs);
  const [bevInputs, setBevInputs] = useState<VehicleInputs>(defaultBEVInputs);
  const [lcfsInputs, setLcfsInputs] = useState<LCFSInputs>(defaultLCFSInputs);
  const [enableLCFS, setEnableLCFS] = useState(true); // Enable LCFS by default for better BEV economics
  const [results, setResults] = useState<{ diesel: CalculatorResults; bev: CalculatorResults } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculateResults = useCallback(() => {
    const calculator = new BEVCostCalculator(dieselInputs, bevInputs, enableLCFS ? lcfsInputs : undefined);
    const calculatedResults = calculator.calculate();
    setResults(calculatedResults);
  }, [dieselInputs, bevInputs, lcfsInputs, enableLCFS]);

  useEffect(() => {
    if (mounted) {
      calculateResults();
    }
  }, [mounted, calculateResults]);

  const updateDieselInput = useCallback((field: keyof VehicleInputs, value: string) => {
    setDieselInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  }, []);

  const updateBEVInput = useCallback((field: keyof VehicleInputs, value: string) => {
    setBevInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  }, []);

  const updateLCFSInput = useCallback((field: keyof LCFSInputs, value: string) => {
    setLcfsInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  }, []);

  const reset = useCallback(() => {
    setDieselInputs(defaultDieselInputs);
    setBevInputs(defaultBEVInputs);
    setLcfsInputs(defaultLCFSInputs);
    setEnableLCFS(true); // Keep LCFS enabled by default
  }, []);

  return {
    dieselInputs,
    bevInputs,
    lcfsInputs,
    enableLCFS,
    results,
    updateDieselInput,
    updateBEVInput,
    updateLCFSInput,
    setEnableLCFS,
    reset
  };
}