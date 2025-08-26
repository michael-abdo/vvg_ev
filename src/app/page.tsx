import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, BarChart3, Grid3X3, Layers, Calculator, Truck, DollarSign, FileSpreadsheet } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BEV Cost Calculator',
  description: 'Compare Battery Electric Vehicle costs vs Diesel with multiple interactive UI approaches',
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            BEV Cost Calculator
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Compare Battery Electric Vehicle (BEV) costs vs Diesel with multiple interactive UI approaches.
            Explore 7 different visualization methods for the same calculation engine with graphs, dashboards, and dynamic comparisons.
          </p>
        </div>
      </div>

      {/* Featured Calculators Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Calculators</h2>
          <p className="text-lg text-gray-600">Our main calculator implementations for practical fleet analysis</p>
        </div>
        
        {/* Featured Three Calculators */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Link href="/calculator/original" className="group">
            <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white border-blue-200">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <FileSpreadsheet className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Original Excel Calculator</h3>
              <p className="text-gray-600 mb-4">
                Direct implementation from the original Excel file with comprehensive BEV vs Diesel analysis
              </p>
              <Button variant="outline" className="group-hover:bg-blue-50">
                Try Original <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Link>
          
          <Link href="/calculator/freightliner" className="group">
            <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white border-slate-200">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-200 transition-colors">
                <Truck className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Freightliner Commercial</h3>
              <p className="text-gray-600 mb-4">
                Professional fleet analysis with tabbed interface, executive summaries, and visual cost comparisons
              </p>
              <Button variant="outline" className="group-hover:bg-slate-50">
                Try Commercial <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Link>
          
          <Link href="/calculator/rizon-hvip" className="group">
            <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white border-amber-200">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors">
                <DollarSign className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rizon HVIP Incentives</h3>
              <p className="text-gray-600 mb-4">
                California HVIP voucher calculator with incentive tiers, disadvantaged community benefits, and LCFS
              </p>
              <Button variant="outline" className="group-hover:bg-amber-50">
                Try HVIP Calculator <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Link>
        </div>

        {/* UI Demonstrations Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Additional UI Demonstrations</h2>
          <p className="text-lg text-gray-600">Explore different visualization approaches using the same calculation engine</p>
        </div>
        
        {/* First row - Line Graph and Dashboard */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Link href="/calculator/line-graph" className="group">
            <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Line Graph Analysis</h3>
              <p className="text-gray-600 mb-4">
                Interactive line charts showing cumulative costs over time with break-even analysis and savings visualization
              </p>
              <Button variant="outline" className="group-hover:bg-blue-50">
                Try Line Graph <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Link>
          
          <Link href="/calculator/dashboard" className="group">
            <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dynamic Dashboard</h3>
              <p className="text-gray-600 mb-4">
                Real-time sliders and controls with preset scenarios and interactive pie charts for instant cost adjustments
              </p>
              <Button variant="outline" className="group-hover:bg-green-50">
                Try Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Link>
        </div>

        {/* Second row - Comparison Cards and Stacked Chart */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Link href="/calculator/comparison-cards" className="group">
            <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Grid3X3 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comparison Cards</h3>
              <p className="text-gray-600 mb-4">
                Side-by-side metric cards with visual indicators and tabbed input controls for easy parameter comparison
              </p>
              <Button variant="outline" className="group-hover:bg-purple-50">
                Try Cards View <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Link>
          
          <Link href="/calculator/stacked-chart" className="group">
            <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                <Layers className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Stacked Bar Charts</h3>
              <p className="text-gray-600 mb-4">
                Detailed cost breakdown by category with yearly analysis and configurable time periods up to 15 years
              </p>
              <Button variant="outline" className="group-hover:bg-orange-50">
                Try Stacked View <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Link>
        </div>

        {/* Third row - Interactive Calculator (centered) */}
        <div className="flex justify-center">
          <Link href="/calculator/interactive" className="group max-w-md">
            <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
                <Calculator className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Calculator</h3>
              <p className="text-gray-600 mb-4">
                Modern form interface with animated radial progress charts and real-time visual feedback
              </p>
              <Button variant="outline" className="group-hover:bg-indigo-50">
                Try Interactive <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Link>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Built With Modern Technologies</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Next.js 15",
              "TypeScript",
              "Tailwind CSS",
              "Recharts",
              "Shadcn/UI",
              "Radix UI",
              "Lucide Icons",
              "LCFS Calculations"
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>BEV Cost Calculator - Compare Electric Vehicle economics with multiple visualization approaches</p>
      </footer>
    </div>
  );
}