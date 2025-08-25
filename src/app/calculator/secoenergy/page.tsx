import { Metadata } from 'next';
import SecoenergyStyleCalculator from '@/components/calculators/SecoenergyStyleCalculator';

export const metadata: Metadata = {
  title: 'Comprehensive EV Savings Calculator | VVG',
  description: 'Detailed electric vehicle savings analysis with charging time breakdowns and maintenance comparisons',
};

export default function SecoenergyCalculatorPage() {
  return <SecoenergyStyleCalculator />;
}