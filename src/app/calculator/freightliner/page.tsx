import { Metadata } from 'next';
import FreightlinerStyleCalculator from '@/components/calculators/FreightlinerStyleCalculator';

export const metadata: Metadata = {
  title: 'Commercial EV TCO Calculator | VVG',
  description: 'Professional Total Cost of Ownership analysis for commercial electric vehicles in Freightliner style',
};

export default function FreightlinerCalculatorPage() {
  return <FreightlinerStyleCalculator />;
}