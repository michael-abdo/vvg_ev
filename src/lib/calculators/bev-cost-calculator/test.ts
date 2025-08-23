// Test script for BEV Cost Calculator
import { 
  BEVCostCalculator, 
  defaultDieselInputs, 
  defaultBEVInputs, 
  defaultLCFSInputs 
} from './index';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPerMile(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

console.log('=== BEV Cost Calculator Test ===\n');

// Test 1: Basic calculation without LCFS
console.log('Test 1: Basic Calculation (No LCFS)');
console.log('-----------------------------------');

const calculator1 = new BEVCostCalculator(defaultDieselInputs, defaultBEVInputs);
const results1 = calculator1.calculate();

console.log('Diesel Vehicle:');
console.log(`  Fuel Cost/Mile: ${formatPerMile(results1.diesel.fuelCostPerMile)}`);
console.log(`  Total Operating Cost/Mile: ${formatPerMile(results1.diesel.totalOperatingCostPerMile)}`);
console.log(`  Annual Operating Cost: ${formatCurrency(results1.diesel.annualOperatingCost)}`);
console.log(`  Net Upfront Cost: ${formatCurrency(results1.diesel.netUpfrontCost)}`);
console.log(`  10-Year Total Cost: ${formatCurrency(results1.diesel.yearlyTotalCosts[9])}`);

console.log('\nBEV:');
console.log(`  Fuel Cost/Mile: ${formatPerMile(results1.bev.fuelCostPerMile)}`);
console.log(`  Total Operating Cost/Mile: ${formatPerMile(results1.bev.totalOperatingCostPerMile)}`);
console.log(`  Annual Operating Cost: ${formatCurrency(results1.bev.annualOperatingCost)}`);
console.log(`  Net Upfront Cost: ${formatCurrency(results1.bev.netUpfrontCost)}`);
console.log(`  10-Year Total Cost: ${formatCurrency(results1.bev.yearlyTotalCosts[9])}`);

console.log(`\n10-Year Savings with BEV: ${formatCurrency(results1.diesel.yearlyTotalCosts[9] - results1.bev.yearlyTotalCosts[9])}`);

// Test 2: Calculation with LCFS
console.log('\n\nTest 2: Calculation with LCFS Credits');
console.log('-------------------------------------');

const calculator2 = new BEVCostCalculator(defaultDieselInputs, defaultBEVInputs, defaultLCFSInputs);
const results2 = calculator2.calculate();

console.log('BEV with LCFS:');
console.log(`  LCFS Credits/Mile: ${formatPerMile(results2.bev.lcfsCreditsPerMile || 0)}`);
console.log(`  LCFS Revenue/Year: ${formatCurrency(results2.bev.lcfsRevenuePerYear || 0)}`);
console.log(`  Adjusted Annual Operating Cost: ${formatCurrency(results2.bev.annualOperatingCost)}`);
console.log(`  10-Year Total Cost: ${formatCurrency(results2.bev.yearlyTotalCosts[9])}`);

console.log(`\n10-Year Savings with BEV+LCFS: ${formatCurrency(results2.diesel.yearlyTotalCosts[9] - results2.bev.yearlyTotalCosts[9])}`);

// Test 3: Custom scenario
console.log('\n\nTest 3: Custom Scenario');
console.log('-----------------------');

const customDiesel = {
  ...defaultDieselInputs,
  fuelPrice: 5.00, // Higher diesel price
  milesPerYear: 100000 // More miles
};

const customBEV = {
  ...defaultBEVInputs,
  truckIncentive: 100000, // With incentives
  infrastructureIncentive: 50000,
  milesPerYear: 100000
};

const calculator3 = new BEVCostCalculator(customDiesel, customBEV, defaultLCFSInputs);
const results3 = calculator3.calculate();

console.log('High Mileage + Incentives Scenario:');
console.log(`  Diesel 10-Year Cost: ${formatCurrency(results3.diesel.yearlyTotalCosts[9])}`);
console.log(`  BEV 10-Year Cost: ${formatCurrency(results3.bev.yearlyTotalCosts[9])}`);
console.log(`  10-Year Savings: ${formatCurrency(results3.diesel.yearlyTotalCosts[9] - results3.bev.yearlyTotalCosts[9])}`);

// Find break-even year
const breakEvenYear = results3.bev.yearlyTotalCosts.findIndex(
  (cost, i) => cost < results3.diesel.yearlyTotalCosts[i]
);
console.log(`  Break-even Year: ${breakEvenYear === -1 ? 'Beyond 10 years' : `Year ${breakEvenYear + 1}`}`);

console.log('\n=== Test Complete ===');