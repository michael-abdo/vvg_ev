import { Metadata } from 'next';
import MccacStyleCalculator from '@/components/calculators/MccacStyleCalculator';

export const metadata: Metadata = {
  title: 'Electric Vehicle Incentives Calculator | VVG',
  description: 'Comprehensive EV savings calculator with regional incentives and educational resources',
};

export default function MccacCalculatorPage() {
  return <MccacStyleCalculator />;
}