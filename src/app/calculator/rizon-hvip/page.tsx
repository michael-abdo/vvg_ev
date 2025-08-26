import { Metadata } from 'next';
import RizonHvipCalculator from '@/components/calculators/RizonHvipCalculator';

export const metadata: Metadata = {
  title: 'Rizon HVIP Calculator - Save up to $138,000 | BEV Cost Calculator',
  description: 'Calculate your savings with HVIP incentives on a new Rizon electric truck. Compare against diesel alternatives and see your total cost of ownership.',
};

export default function RizonHvipPage() {
  return <RizonHvipCalculator />;
}