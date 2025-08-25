import { Metadata } from 'next';
import ToyotaStyleCalculator from '@/components/calculators/ToyotaStyleCalculator';

export const metadata: Metadata = {
  title: 'Electric Vehicle Savings Calculator | VVG',
  description: 'Discover your savings with electric vehicles through our friendly, step-by-step calculator',
};

export default function ToyotaCalculatorPage() {
  return <ToyotaStyleCalculator />;
}