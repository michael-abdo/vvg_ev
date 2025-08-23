// BEV Cost of Ownership Calculator
// Implements formulas from Plastic Express BEV Cost of Ownership Calculator Excel

export interface VehicleInputs {
  // Upfront Costs
  truckCost: number;
  infrastructureCost: number;
  truckIncentive: number;
  infrastructureIncentive: number;
  residualValue: number;
  
  // Operating Costs
  fuelPrice: number; // $/gal for diesel, $/kWh for BEV
  efficiency: number; // MPG for diesel, kWh/mi for BEV
  maintenancePerMile: number;
  insurancePerMile: number;
  otherPerMile: number;
  
  // Annual Usage
  milesPerYear: number;
}

export interface LCFSInputs {
  // Energy conversions
  energyDensity: number; // MJ/gal or MJ/kWh
  
  // LCFS parameters
  dieselCI: number; // gCO2e/MJ
  electricityCI: number; // gCO2e/MJ
  eer: number; // Energy Economy Ratio
  lcfsCreditPrice: number; // $/credit
}

export interface CalculatorResults {
  // Per-mile costs
  fuelCostPerMile: number;
  totalOperatingCostPerMile: number;
  
  // Annual costs
  annualOperatingCost: number;
  
  // Total costs over years
  netUpfrontCost: number;
  yearlyTotalCosts: number[];
  
  // LCFS calculations
  lcfsCreditsPerMile?: number;
  lcfsRevenuePerYear?: number;
}

export class BEVCostCalculator {
  private dieselInputs: VehicleInputs;
  private bevInputs: VehicleInputs;
  private lcfsInputs?: LCFSInputs;
  
  constructor(
    dieselInputs: VehicleInputs,
    bevInputs: VehicleInputs,
    lcfsInputs?: LCFSInputs
  ) {
    this.dieselInputs = dieselInputs;
    this.bevInputs = bevInputs;
    this.lcfsInputs = lcfsInputs;
  }
  
  // Calculator Sheet Formulas
  calculateFuelCostPerMile(inputs: VehicleInputs, isDiesel: boolean): number {
    if (isDiesel) {
      // C18: =C16/C17 ($/gal / MPG)
      return inputs.fuelPrice / inputs.efficiency;
    } else {
      // E18: =E16*E17 ($/kWh * kWh/mi)
      return inputs.fuelPrice * inputs.efficiency;
    }
  }
  
  calculateTotalOperatingCostPerMile(inputs: VehicleInputs, isDiesel: boolean): number {
    const fuelCost = this.calculateFuelCostPerMile(inputs, isDiesel);
    return fuelCost + inputs.maintenancePerMile + inputs.insurancePerMile + inputs.otherPerMile;
  }
  
  calculateNetUpfrontCost(inputs: VehicleInputs): number {
    // C27/E27: =SUM(C8,C9)-SUM(C11+C12)
    const totalUpfront = inputs.truckCost + inputs.infrastructureCost;
    const totalIncentives = inputs.truckIncentive + inputs.infrastructureIncentive;
    return totalUpfront - totalIncentives;
  }
  
  calculateAnnualOperatingCost(inputs: VehicleInputs, isDiesel: boolean): number {
    // C29/E29: =(SUM(C18,C19,C20,C21)-SUM(C23,C24))*C26
    const operatingCostPerMile = this.calculateTotalOperatingCostPerMile(inputs, isDiesel);
    return operatingCostPerMile * inputs.milesPerYear;
  }
  
  calculateYearOneTotalCost(inputs: VehicleInputs, isDiesel: boolean): number {
    // C31/E31: =SUM(C8,C9)-SUM(C11,C12,C14)
    const totalUpfront = inputs.truckCost + inputs.infrastructureCost;
    const totalDeductions = inputs.truckIncentive + inputs.infrastructureIncentive + inputs.residualValue;
    return totalUpfront - totalDeductions;
  }
  
  calculateCumulativeCosts(inputs: VehicleInputs, isDiesel: boolean, years: number = 10): number[] {
    const yearOneCost = this.calculateYearOneTotalCost(inputs, isDiesel);
    const annualOperatingCost = this.calculateAnnualOperatingCost(inputs, isDiesel);
    
    const costs: number[] = [];
    
    // Year 1 (C32/E32: =SUM(C31,C$29))
    costs.push(yearOneCost + annualOperatingCost);
    
    // Years 2-10 (C33-C41: =SUM(C32,C$29) etc.)
    for (let i = 1; i < years; i++) {
      costs.push(costs[i - 1] + annualOperatingCost);
    }
    
    return costs;
  }
  
  // LCFS and ISR Sheet Formulas
  calculateLCFSCredits(bevInputs: VehicleInputs, lcfsInputs: LCFSInputs): number {
    // Constants for LCFS calculation
    const MJ_PER_KWH = 3.6; // Conversion factor
    const MT_TO_CREDIT = 1; // 1 metric ton = 1 credit
    const G_TO_MT = 0.000001; // grams to metric tons
    
    // Calculate energy per mile for BEV (MJ/mile)
    const mjPerMile = bevInputs.efficiency * MJ_PER_KWH;
    
    // Calculate CI reduction (gCO2e/MJ)
    const ciReduction = lcfsInputs.dieselCI - lcfsInputs.electricityCI;
    
    // Apply EER adjustment (higher EER = more credits)
    const eerAdjustedReduction = ciReduction * lcfsInputs.eer;
    
    // Calculate gCO2e reduced per mile
    const gCO2PerMile = eerAdjustedReduction * mjPerMile;
    
    // Convert to metric tons and then to credits
    const creditsPerMile = gCO2PerMile * G_TO_MT * MT_TO_CREDIT;
    
    // Calculate revenue per mile
    const revenuePerMile = creditsPerMile * lcfsInputs.lcfsCreditPrice;
    
    return revenuePerMile;
  }
  
  // Main calculation method
  calculate(): { diesel: CalculatorResults; bev: CalculatorResults } {
    const dieselResults = this.calculateVehicleResults(this.dieselInputs, true);
    const bevResults = this.calculateVehicleResults(this.bevInputs, false);
    
    // Add LCFS calculations for BEV if inputs provided
    if (this.lcfsInputs) {
      bevResults.lcfsCreditsPerMile = this.calculateLCFSCredits(this.bevInputs, this.lcfsInputs);
      bevResults.lcfsRevenuePerYear = bevResults.lcfsCreditsPerMile * this.bevInputs.milesPerYear;
      
      // Recalculate with LCFS revenue included
      const adjustedAnnualCost = bevResults.annualOperatingCost - bevResults.lcfsRevenuePerYear;
      const yearOneCost = this.calculateYearOneTotalCost(this.bevInputs, false);
      
      // Recalculate cumulative costs with LCFS savings
      bevResults.yearlyTotalCosts = [];
      bevResults.yearlyTotalCosts.push(yearOneCost + adjustedAnnualCost);
      
      for (let i = 1; i < 10; i++) {
        bevResults.yearlyTotalCosts.push(bevResults.yearlyTotalCosts[i - 1] + adjustedAnnualCost);
      }
      
      // Update the annual operating cost to reflect LCFS revenue
      bevResults.annualOperatingCost = adjustedAnnualCost;
    }
    
    return { diesel: dieselResults, bev: bevResults };
  }
  
  private calculateVehicleResults(inputs: VehicleInputs, isDiesel: boolean): CalculatorResults {
    const fuelCostPerMile = this.calculateFuelCostPerMile(inputs, isDiesel);
    const totalOperatingCostPerMile = this.calculateTotalOperatingCostPerMile(inputs, isDiesel);
    const annualOperatingCost = this.calculateAnnualOperatingCost(inputs, isDiesel);
    const netUpfrontCost = this.calculateNetUpfrontCost(inputs);
    const yearlyTotalCosts = this.calculateCumulativeCosts(inputs, isDiesel);
    
    return {
      fuelCostPerMile,
      totalOperatingCostPerMile,
      annualOperatingCost,
      netUpfrontCost,
      yearlyTotalCosts
    };
  }
}

// Default values from the Excel sheet
export const defaultDieselInputs: VehicleInputs = {
  truckCost: 175853,
  infrastructureCost: 0,
  truckIncentive: 0,
  infrastructureIncentive: 0,
  residualValue: 80000,
  fuelPrice: 4.23, // $/gal
  efficiency: 5.5, // MPG
  maintenancePerMile: 0.75,
  insurancePerMile: 0.29,
  otherPerMile: 0,
  milesPerYear: 70000
};

export const defaultBEVInputs: VehicleInputs = {
  truckCost: 586525,
  infrastructureCost: 0,
  truckIncentive: 0,
  infrastructureIncentive: 0,
  residualValue: 0,
  fuelPrice: 0.4, // $/kWh
  efficiency: 2.2, // kWh/mi
  maintenancePerMile: 0.6,
  insurancePerMile: 0.29,
  otherPerMile: 0,
  milesPerYear: 70000
};

export const defaultLCFSInputs: LCFSInputs = {
  energyDensity: 130, // MJ/gal for diesel
  dieselCI: 100.45, // gCO2e/MJ
  electricityCI: 25.0, // gCO2e/MJ
  eer: 5.0, // Energy Economy Ratio
  lcfsCreditPrice: 150 // $/credit
};