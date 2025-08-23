import { CalculatorNavigation } from '@/components/calculators/shared/calculator-navigation';

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <CalculatorNavigation />
      <main>{children}</main>
    </div>
  );
}