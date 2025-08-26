import { NextRequest, NextResponse } from 'next/server';
import PDFKit from 'pdfkit';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting PDF generation...');
    
    // Parse request body
    const body = await request.json();
    const { type } = body;
    console.log('Request type:', type);

    // Validate request
    if (!type) {
      return NextResponse.json(
        { error: 'PDF type is required' },
        { status: 400 }
      );
    }

    console.log('Creating PDF document...');
    
    // Create PDF document with minimal options
    const doc = new PDFKit({
      size: 'LETTER',
      bufferPages: true
    });

    console.log('Adding content to PDF...');
    
    // Use Courier font explicitly to avoid Helvetica issues
    doc.font('Courier');
    doc.fontSize(20);
    doc.text('BEV Cost Calculator Report', 50, 50);
    doc.fontSize(12);
    doc.text('This is a test PDF generated from the BEV Cost Calculator.', 50, 100);
    doc.text(`Generated on: ${new Date().toISOString()}`, 50, 120);
    doc.text('Features:', 50, 160);
    doc.text('• Original Excel Calculator', 70, 180);
    doc.text('• Freightliner Commercial', 70, 200);
    doc.text('• Rizon HVIP Incentives', 70, 220);
    doc.text('• Multiple UI demonstrations', 70, 240);
    
    console.log('Setting up PDF buffer collection...');
    
    // Buffer to store PDF data
    const chunks: Buffer[] = [];
    
    // Create promise to wait for PDF completion
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => {
        console.log('Received PDF chunk:', chunk.length);
        chunks.push(chunk);
      });
      doc.on('end', () => {
        console.log('PDF generation complete, total chunks:', chunks.length);
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', (error) => {
        console.error('PDF generation error:', error);
        reject(error);
      });
    });

    console.log('Finalizing PDF...');
    // Finalize PDF
    doc.end();

    console.log('Waiting for PDF completion...');
    // Wait for PDF generation to complete
    const pdfBuffer = await pdfPromise;
    console.log('PDF buffer size:', pdfBuffer.length);

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="bev-calculator-report.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    );
  }
}

async function generateOverviewPDF(doc: PDFKit.PDFDocument, _calculatorData: any) {
  // Add header
  doc.fontSize(20).font('Helvetica-Bold');
  doc.text('BEV Cost Calculator', 50, 50);
  doc.fontSize(14).font('Helvetica');
  doc.text('Battery Electric Vehicle Cost Analysis Overview', 50, 80);
  
  // Add separator line
  doc.moveTo(50, 110).lineTo(550, 110).stroke();
  
  // Add content sections
  let yPosition = 130;
  
  // Introduction section
  doc.fontSize(16).font('Helvetica-Bold');
  doc.text('Overview', 50, yPosition);
  yPosition += 30;
  
  doc.fontSize(12).font('Helvetica');
  doc.text('This report provides an overview of the BEV Cost Calculator application.', 50, yPosition);
  yPosition += 20;
  doc.text('The calculator helps compare Battery Electric Vehicle costs vs Diesel with multiple', 50, yPosition);
  yPosition += 15;
  doc.text('interactive UI approaches and visualization methods.', 50, yPosition);
  yPosition += 40;
  
  // Features section
  doc.fontSize(16).font('Helvetica-Bold');
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
  
  doc.fontSize(12).font('Helvetica');
  features.forEach((feature) => {
    doc.text(`• ${feature}`, 70, yPosition);
    yPosition += 20;
  });
  
  yPosition += 20;
  
  // Technical specifications
  doc.fontSize(16).font('Helvetica-Bold');
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
  
  doc.fontSize(12).font('Helvetica');
  techSpecs.forEach((spec) => {
    doc.text(`• ${spec}`, 70, yPosition);
    yPosition += 20;
  });
  
  // Footer
  doc.fontSize(10).font('Helvetica');
  doc.text('Generated by BEV Cost Calculator', 50, 750);
  doc.text(`Report generated on ${new Date().toLocaleDateString()}`, 50, 765);
}

async function generateCalculatorPDF(doc: PDFKit.PDFDocument, _calculatorData: any) {
  // This will be implemented for specific calculator results
  doc.fontSize(20).font('Helvetica-Bold');
  doc.text('BEV Calculator Results', 50, 50);
  
  // Add calculator-specific content here
  doc.fontSize(12).font('Helvetica');
  doc.text('Calculator results will be displayed here when implemented.', 50, 100);
}