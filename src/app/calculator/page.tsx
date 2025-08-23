import { CalculatorVariantGrid } from '@/components/calculators/shared/calculator-navigation';

export default function CalculatorShowcase() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          BEV Cost Calculator Showcase
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore different visualizations and interfaces for comparing the total cost of ownership 
          between Diesel and Battery Electric Vehicles. Each variant uses the same underlying calculations 
          but presents the data in unique ways.
        </p>
      </div>
      
      <CalculatorVariantGrid />
      
      <div className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          About These Calculators
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-gray-700">
          <div>
            <h3 className="font-semibold mb-2">Consistent Calculations</h3>
            <p className="text-sm">
              All calculator variants use the same core calculation engine, ensuring consistent 
              results across different interfaces. The calculations include vehicle costs, 
              incentives, fuel/energy consumption, maintenance, and optional LCFS credits.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Different Perspectives</h3>
            <p className="text-sm">
              Each interface offers a unique way to visualize and interact with the data. 
              From interactive graphs to real-time sliders, choose the view that best suits 
              your analysis needs and presentation style.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}