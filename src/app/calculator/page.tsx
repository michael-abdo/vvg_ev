import { Metadata } from 'next';
import BEVCostCalculator from '@/components/calculators/BEVCostCalculator';

export const metadata: Metadata = {
  title: 'BEV Cost Calculator',
  description: 'Compare total cost of ownership between Diesel and Battery Electric Vehicles',
};

export default function CalculatorPage() {
  return <BEVCostCalculator />;
}