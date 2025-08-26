import { NextRequest, NextResponse } from 'next/server';
import PDFKit from 'pdfkit';
import { jsPDF } from 'jspdf';
import {
  BEVCostCalculator,
  VehicleInputs,
  LCFSInputs,
  defaultDieselInputs,
  defaultBEVInputs,
  defaultLCFSInputs
} from '@/lib/calculators/bev-cost-calculator';
import { generateBarChartImage, generateLineChartImage, ChartData } from '@/lib/pdf/chart-generator';

export async function POST(request: NextRequest) {
  // Set up timeout handling
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000); // 30 second timeout

  try {
    console.log('Starting PDF generation...');
    
    // Parse request body
    const body = await request.json();
    const { type, dieselInputs, bevInputs, lcfsInputs, enableLCFS, preparedFor, preparedBy } = body;
    console.log('Request type:', type);

    // Validate request
    if (!type) {
      return NextResponse.json(
        { error: 'PDF type is required' },
        { status: 400 }
      );
    }

    // Use default inputs if not provided
    const finalDieselInputs = dieselInputs || defaultDieselInputs;
    const finalBevInputs = bevInputs || defaultBEVInputs;
    const finalLcfsInputs = lcfsInputs || defaultLCFSInputs;

    console.log('Calculating BEV cost analysis...');
    
    // Generate calculator results
    const calculator = new BEVCostCalculator(
      finalDieselInputs,
      finalBevInputs,
      enableLCFS ? finalLcfsInputs : undefined
    );
    const results = calculator.calculate();
    console.log('Calculator results generated');

    // Try jsPDF first as it doesn't have font loading issues
    console.log('Using jsPDF for PDF generation...');
    const pdfBuffer = await generateJsPDFDocument(type, results, {
      preparedFor,
      preparedBy,
      enableLCFS: !!enableLCFS,
      dieselInputs: finalDieselInputs,
      bevInputs: finalBevInputs,
      lcfsInputs: finalLcfsInputs
    });
    console.log('jsPDF buffer size:', pdfBuffer.length);

    // Clear the timeout
    clearTimeout(timeout);

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="bev-calculator-report.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    // Clear the timeout
    clearTimeout(timeout);
    
    console.error('PDF generation error:', error);
    
    // Check if it was a timeout
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'PDF generation timeout', details: 'The request took too long to process. Please try again.' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function for formatting currency values
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Helper function for formatting per-mile values
function formatPerMile(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value);
}

async function generateJsPDFDocument(
  type: string, 
  results?: any, 
  options?: {
    preparedFor?: string;
    preparedBy?: string;
    enableLCFS?: boolean;
    dieselInputs?: VehicleInputs;
    bevInputs?: VehicleInputs;
    lcfsInputs?: LCFSInputs;
  }
): Promise<Buffer> {
  console.log('Creating jsPDF document...');
  
  // Create new jsPDF instance
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });
  
  console.log('Adding content to jsPDF...');
  
  let yPosition = 20;
  
  // Add title and header
  doc.setFontSize(20);
  doc.text('BEV Cost Calculator Report', 20, yPosition);
  yPosition += 15;
  
  // Add prepared for/by if provided
  if (options?.preparedFor || options?.preparedBy) {
    doc.setFontSize(10);
    if (options.preparedFor) {
      doc.text(`Prepared for: ${options.preparedFor}`, 20, yPosition);
      yPosition += 8;
    }
    if (options.preparedBy) {
      doc.text(`Prepared by: ${options.preparedBy}`, 20, yPosition);
      yPosition += 8;
    }
    yPosition += 5;
  }
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
  yPosition += 15;
  
  // Generate charts if we have results
  let barChartBuffer: Buffer | null = null;
  let lineChartBuffer: Buffer | null = null;
  
  if (results) {
    console.log('Generating charts...');
    
    // Generate bar chart for Total Cost of Ownership
    try {
      const barChartData: ChartData[] = [
        {
          label: 'Diesel',
          value: results.diesel.yearlyTotalCosts[9],
          color: '#64748b' // slate-500
        },
        {
          label: 'Electric',
          value: results.bev.yearlyTotalCosts[9],
          color: '#3b82f6' // blue-500
        }
      ];
      
      barChartBuffer = await generateBarChartImage({
        width: 400,
        height: 300,
        title: '10-Year Total Cost Comparison',
        data: barChartData,
        yAxisLabel: 'Total Cost ($)'
      });
      console.log('Bar chart generated successfully');
    } catch (error) {
      console.error('Error generating bar chart:', error);
    }
    
    // Generate line chart for year-by-year progression
    try {
      const lineChartData = Array.from({ length: 10 }, (_, i) => ({
        year: `Year ${i + 1}`,
        diesel: results.diesel.yearlyTotalCosts[i],
        bev: results.bev.yearlyTotalCosts[i]
      }));
      
      lineChartBuffer = await generateLineChartImage({
        width: 400,
        height: 300,
        title: 'Year-by-Year Cost Progression',
        data: lineChartData,
        yAxisLabel: 'Cumulative Cost ($)'
      });
      console.log('Line chart generated successfully');
    } catch (error) {
      console.error('Error generating line chart:', error);
    }
  }
  
  // Executive Summary Section
  if (results) {
    doc.setFontSize(16);
    doc.text('Executive Summary', 20, yPosition);
    yPosition += 10;
    
    const dieselTotalCost = results.diesel.yearlyTotalCosts[9];
    const bevTotalCost = results.bev.yearlyTotalCosts[9];
    const savings = dieselTotalCost - bevTotalCost;
    
    // Calculate break-even point
    const breakEvenIndex = results.bev.yearlyTotalCosts.findIndex(
      (cost: number, i: number) => cost < results.diesel.yearlyTotalCosts[i]
    );
    const breakEvenText = breakEvenIndex === -1 ? 'Beyond 10 years' : `Year ${breakEvenIndex + 1}`;
    
    doc.setFontSize(12);
    doc.text(`10-Year Total Cost Comparison:`, 20, yPosition);
    yPosition += 8;
    doc.text(`  Diesel Fleet: ${formatCurrency(dieselTotalCost)}`, 25, yPosition);
    yPosition += 8;
    doc.text(`  Electric Fleet: ${formatCurrency(bevTotalCost)}`, 25, yPosition);
    yPosition += 8;
    doc.text(`  Net Savings: ${savings > 0 ? formatCurrency(savings) : 'Loss of ' + formatCurrency(Math.abs(savings))}`, 25, yPosition);
    yPosition += 8;
    doc.text(`  Break-even Point: ${breakEvenText}`, 25, yPosition);
    yPosition += 15;
    
    // Cost Breakdown Table
    doc.setFontSize(16);
    doc.text('Detailed Cost Analysis', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.text('Cost Category', 20, yPosition);
    doc.text('Diesel', 80, yPosition);
    doc.text('Electric', 120, yPosition);
    doc.text('Difference', 160, yPosition);
    yPosition += 8;
    
    // Add line separator
    doc.line(20, yPosition, 200, yPosition);
    yPosition += 5;
    
    // Net Upfront Cost
    doc.text('Net Upfront Cost', 20, yPosition);
    doc.text(formatCurrency(results.diesel.netUpfrontCost), 80, yPosition);
    doc.text(formatCurrency(results.bev.netUpfrontCost), 120, yPosition);
    doc.text(formatCurrency(results.bev.netUpfrontCost - results.diesel.netUpfrontCost), 160, yPosition);
    yPosition += 8;
    
    // Fuel Cost per Mile
    doc.text('Fuel Cost per Mile', 20, yPosition);
    doc.text(formatPerMile(results.diesel.fuelCostPerMile), 80, yPosition);
    doc.text(formatPerMile(results.bev.fuelCostPerMile), 120, yPosition);
    doc.text(formatPerMile(results.bev.fuelCostPerMile - results.diesel.fuelCostPerMile), 160, yPosition);
    yPosition += 8;
    
    // Annual Operating Cost
    doc.text('Annual Operating Cost', 20, yPosition);
    doc.text(formatCurrency(results.diesel.annualOperatingCost), 80, yPosition);
    doc.text(formatCurrency(results.bev.annualOperatingCost), 120, yPosition);
    doc.text(formatCurrency(results.bev.annualOperatingCost - results.diesel.annualOperatingCost), 160, yPosition);
    yPosition += 8;
    
    // LCFS Revenue if enabled
    if (results.bev.lcfsRevenuePerYear) {
      doc.text('LCFS Revenue per Year', 20, yPosition);
      doc.text('-', 80, yPosition);
      doc.text('+' + formatCurrency(results.bev.lcfsRevenuePerYear), 120, yPosition);
      doc.text('+' + formatCurrency(results.bev.lcfsRevenuePerYear), 160, yPosition);
      yPosition += 8;
    }
    
    yPosition += 10;
    
    // Vehicle Specifications if space allows
    if (yPosition < 240) {
      doc.setFontSize(16);
      doc.text('Vehicle Specifications', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.text('Diesel Vehicle:', 20, yPosition);
      yPosition += 6;
      doc.text(`  Purchase Cost: ${formatCurrency(options?.dieselInputs?.truckCost || 0)}`, 25, yPosition);
      yPosition += 6;
      doc.text(`  Fuel Efficiency: ${options?.dieselInputs?.efficiency || 0} MPG`, 25, yPosition);
      yPosition += 6;
      doc.text(`  Annual Miles: ${(options?.dieselInputs?.milesPerYear || 0).toLocaleString()}`, 25, yPosition);
      yPosition += 10;
      
      doc.text('Electric Vehicle:', 20, yPosition);
      yPosition += 6;
      doc.text(`  Purchase Cost: ${formatCurrency(options?.bevInputs?.truckCost || 0)}`, 25, yPosition);
      yPosition += 6;
      doc.text(`  Energy Efficiency: ${options?.bevInputs?.efficiency || 0} kWh/mile`, 25, yPosition);
      yPosition += 6;
      doc.text(`  Annual Miles: ${(options?.bevInputs?.milesPerYear || 0).toLocaleString()}`, 25, yPosition);
    }
    
    // Add charts to second page
    if (barChartBuffer || lineChartBuffer) {
      doc.addPage();
      yPosition = 20;
      
      doc.setFontSize(16);
      doc.text('Cost Analysis Charts', 20, yPosition);
      yPosition += 15;
      
      // Add bar chart
      if (barChartBuffer) {
        try {
          const barChartBase64 = barChartBuffer.toString('base64');
          doc.addImage(`data:image/png;base64,${barChartBase64}`, 'PNG', 20, yPosition, 170, 127.5);
          yPosition += 140;
        } catch (error) {
          console.error('Error adding bar chart to PDF:', error);
          doc.setFontSize(10);
          doc.text('Error: Could not load Total Cost Comparison chart', 20, yPosition);
          yPosition += 20;
        }
      }
      
      // Add line chart
      if (lineChartBuffer && yPosition < 150) {
        try {
          const lineChartBase64 = lineChartBuffer.toString('base64');
          doc.addImage(`data:image/png;base64,${lineChartBase64}`, 'PNG', 20, yPosition, 170, 127.5);
          yPosition += 140;
        } catch (error) {
          console.error('Error adding line chart to PDF:', error);
          doc.setFontSize(10);
          doc.text('Error: Could not load Year-by-Year Progression chart', 20, yPosition);
          yPosition += 20;
        }
      } else if (lineChartBuffer) {
        // Add line chart on a new page if no space
        doc.addPage();
        yPosition = 20;
        try {
          const lineChartBase64 = lineChartBuffer.toString('base64');
          doc.addImage(`data:image/png;base64,${lineChartBase64}`, 'PNG', 20, yPosition, 170, 127.5);
        } catch (error) {
          console.error('Error adding line chart to PDF:', error);
          doc.setFontSize(10);
          doc.text('Error: Could not load Year-by-Year Progression chart', 20, yPosition);
        }
      }
    }
  } else {
    // Fallback content for overview type without results
    doc.setFontSize(12);
    doc.text('This is a PDF generated from the BEV Cost Calculator.', 20, yPosition);
    yPosition += 10;
    doc.text('Features:', 20, yPosition);
    yPosition += 8;
    doc.text('• Original Excel Calculator', 25, yPosition);
    yPosition += 8;
    doc.text('• Freightliner Commercial', 25, yPosition);
    yPosition += 8;
    doc.text('• Rizon HVIP Incentives', 25, yPosition);
    yPosition += 8;
    doc.text('• Multiple UI demonstrations', 25, yPosition);
  }
  
  // Add footer
  doc.setFontSize(10);
  doc.text('Generated by BEV Cost Calculator', 20, 270);
  doc.text(`Report generated on ${new Date().toLocaleDateString()}`, 20, 280);
  
  console.log('Converting jsPDF to buffer...');
  
  // Convert to buffer
  const pdfArrayBuffer = doc.output('arraybuffer');
  const pdfBuffer = Buffer.from(pdfArrayBuffer);
  
  console.log('jsPDF generation complete');
  return pdfBuffer;
}

async function generateOverviewPDF(doc: PDFKit.PDFDocument, _calculatorData: any) {
  // Add header
  doc.fontSize(20);
  doc.text('BEV Cost Calculator', 50, 50);
  doc.fontSize(14);
  doc.text('Battery Electric Vehicle Cost Analysis Overview', 50, 80);
  
  // Add separator line
  doc.moveTo(50, 110).lineTo(550, 110).stroke();
  
  // Add content sections
  let yPosition = 130;
  
  // Introduction section
  doc.fontSize(16);
  doc.text('Overview', 50, yPosition);
  yPosition += 30;
  
  doc.fontSize(12);
  doc.text('This report provides an overview of the BEV Cost Calculator application.', 50, yPosition);
  yPosition += 20;
  doc.text('The calculator helps compare Battery Electric Vehicle costs vs Diesel with multiple', 50, yPosition);
  yPosition += 15;
  doc.text('interactive UI approaches and visualization methods.', 50, yPosition);
  yPosition += 40;
  
  // Features section
  doc.fontSize(16);
  doc.text('Key Features', 50, yPosition);
  yPosition += 30;
  
  const features = [
    'Original Excel Calculator - Direct implementation from Excel file',
    'Freightliner Commercial - Professional fleet analysis interface',
    'Rizon HVIP Incentives - California HVIP voucher calculator',
    'Line Graph Analysis - Interactive charts and break-even analysis',
    'Dynamic Dashboard - Real-time sliders and controls',
    'Comparison Cards - Side-by-side metric comparisons',
    'Stacked Bar Charts - Detailed cost breakdown by category'
  ];
  
  doc.fontSize(12);
  features.forEach((feature) => {
    doc.text(`• ${feature}`, 70, yPosition);
    yPosition += 20;
  });
  
  yPosition += 20;
  
  // Technical specifications
  doc.fontSize(16);
  doc.text('Technical Specifications', 50, yPosition);
  yPosition += 30;
  
  const techSpecs = [
    'Built with Next.js 15 and TypeScript',
    'Styled with Tailwind CSS and Shadcn/UI components',
    'Interactive charts powered by Recharts',
    'Comprehensive LCFS (Low Carbon Fuel Standard) calculations',
    'Professional PDF export functionality',
    'Responsive design for all device types'
  ];
  
  doc.fontSize(12);
  techSpecs.forEach((spec) => {
    doc.text(`• ${spec}`, 70, yPosition);
    yPosition += 20;
  });
  
  // Footer
  doc.fontSize(10);
  doc.text('Generated by BEV Cost Calculator', 50, 750);
  doc.text(`Report generated on ${new Date().toLocaleDateString()}`, 50, 765);
}

async function generateCalculatorPDF(doc: PDFKit.PDFDocument, _calculatorData: any) {
  // This will be implemented for specific calculator results
  doc.fontSize(20);
  doc.text('BEV Calculator Results', 50, 50);
  
  // Add calculator-specific content here
  doc.fontSize(12);
  doc.text('Calculator results will be displayed here when implemented.', 50, 100);
}