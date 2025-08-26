import { createCanvas } from 'canvas';

export interface ChartData {
  label: string;
  value: number;
  color: string;
}

export interface BarChartOptions {
  width: number;
  height: number;
  title: string;
  data: ChartData[];
  yAxisLabel?: string;
  backgroundColor?: string;
}

export interface LineChartOptions {
  width: number;
  height: number;
  title: string;
  data: Array<{ year: string; diesel: number; bev: number; }>;
  yAxisLabel?: string;
  backgroundColor?: string;
}

/**
 * Generate a bar chart image for Total Cost of Ownership comparison
 */
export async function generateBarChartImage(options: BarChartOptions): Promise<Buffer> {
  const { width, height, title, data, yAxisLabel = 'Cost ($)', backgroundColor = '#ffffff' } = options;
  
  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Set background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  // Chart dimensions
  const margin = { top: 60, right: 40, bottom: 80, left: 80 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => d.value));
  const scale = chartHeight / maxValue;
  
  // Draw title
  ctx.fillStyle = '#1e293b'; // slate-800
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, 30);
  
  // Draw bars
  const barWidth = chartWidth / data.length * 0.8;
  const barSpacing = chartWidth / data.length * 0.2;
  
  data.forEach((item, index) => {
    const x = margin.left + (index * (barWidth + barSpacing)) + barSpacing / 2;
    const barHeight = item.value * scale;
    const y = margin.top + chartHeight - barHeight;
    
    // Draw bar with gradient effect
    const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
    gradient.addColorStop(0, item.color);
    gradient.addColorStop(1, item.color + '80'); // Add transparency
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Add border
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);
    
    // Add value label on top of bar
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    const formattedValue = `$${(item.value / 1000000).toFixed(1)}M`;
    ctx.fillText(formattedValue, x + barWidth / 2, y - 10);
    
    // Add category label
    ctx.font = '14px Arial';
    ctx.fillText(item.label, x + barWidth / 2, height - 30);
  });
  
  // Draw Y-axis
  ctx.strokeStyle = '#64748b'; // slate-500
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top);
  ctx.lineTo(margin.left, margin.top + chartHeight);
  ctx.stroke();
  
  // Draw X-axis
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top + chartHeight);
  ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
  ctx.stroke();
  
  // Y-axis label
  ctx.save();
  ctx.translate(20, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#64748b';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(yAxisLabel, 0, 0);
  ctx.restore();
  
  // Convert to PNG buffer
  return canvas.toBuffer('image/png');
}

/**
 * Generate a line chart image for year-by-year cost progression
 */
export async function generateLineChartImage(options: LineChartOptions): Promise<Buffer> {
  const { width, height, title, data, yAxisLabel = 'Cumulative Cost ($)', backgroundColor = '#ffffff' } = options;
  
  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Set background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  // Chart dimensions
  const margin = { top: 60, right: 40, bottom: 80, left: 100 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Find max value for scaling
  const allValues = data.flatMap(d => [d.diesel, d.bev]);
  const maxValue = Math.max(...allValues);
  const scaleY = chartHeight / maxValue;
  const scaleX = chartWidth / (data.length - 1);
  
  // Draw title
  ctx.fillStyle = '#1e293b'; // slate-800
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, 30);
  
  // Draw grid lines
  ctx.strokeStyle = '#e2e8f0'; // slate-200
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = margin.top + (chartHeight * i) / 5;
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(margin.left + chartWidth, y);
    ctx.stroke();
  }
  
  // Draw diesel line
  ctx.strokeStyle = '#64748b'; // slate-500
  ctx.lineWidth = 3;
  ctx.beginPath();
  data.forEach((point, index) => {
    const x = margin.left + index * scaleX;
    const y = margin.top + chartHeight - (point.diesel * scaleY);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
  
  // Draw BEV line
  ctx.strokeStyle = '#3b82f6'; // blue-500
  ctx.lineWidth = 3;
  ctx.beginPath();
  data.forEach((point, index) => {
    const x = margin.left + index * scaleX;
    const y = margin.top + chartHeight - (point.bev * scaleY);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
  
  // Add data points
  data.forEach((point, index) => {
    const x = margin.left + index * scaleX;
    
    // Diesel point
    const dieselY = margin.top + chartHeight - (point.diesel * scaleY);
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(x, dieselY, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // BEV point
    const bevY = margin.top + chartHeight - (point.bev * scaleY);
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(x, bevY, 4, 0, 2 * Math.PI);
    ctx.fill();
  });
  
  // Draw axes
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  
  // Y-axis
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top);
  ctx.lineTo(margin.left, margin.top + chartHeight);
  ctx.stroke();
  
  // X-axis
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top + chartHeight);
  ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
  ctx.stroke();
  
  // X-axis labels (years)
  ctx.fillStyle = '#64748b';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  data.forEach((point, index) => {
    if (index % 2 === 0 || index === data.length - 1) { // Show every other year + last
      const x = margin.left + index * scaleX;
      ctx.fillText(point.year.replace('Year ', ''), x, height - 20);
    }
  });
  
  // Y-axis labels
  ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const value = (maxValue * i) / 5;
    const y = margin.top + chartHeight - (chartHeight * i) / 5;
    ctx.fillText(`$${(value / 1000000).toFixed(1)}M`, margin.left - 10, y + 4);
  }
  
  // Y-axis label
  ctx.save();
  ctx.translate(20, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#64748b';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(yAxisLabel, 0, 0);
  ctx.restore();
  
  // Legend
  const legendY = height - 50;
  
  // Diesel legend
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width - 200, legendY);
  ctx.lineTo(width - 180, legendY);
  ctx.stroke();
  ctx.fillStyle = '#64748b';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Diesel Fleet', width - 175, legendY + 4);
  
  // BEV legend
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width - 90, legendY);
  ctx.lineTo(width - 70, legendY);
  ctx.stroke();
  ctx.fillStyle = '#3b82f6';
  ctx.fillText('Electric Fleet', width - 65, legendY + 4);
  
  // Convert to PNG buffer
  return canvas.toBuffer('image/png');
}