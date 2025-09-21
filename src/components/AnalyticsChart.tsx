'use client';

import { ChartConfig } from '@/types/analytics';

type ChartDataItem = Record<string, string | number | undefined>;

interface AnalyticsChartProps {
  data: ChartDataItem[];
  type: 'line' | 'bar' | 'pie' | 'area';
  config: ChartConfig;
}

export default function AnalyticsChart({ data, type, config }: AnalyticsChartProps) {
  // For MVP, we'll create simple SVG charts
  // In production, you would use Recharts or D3.js
  
  const getChartHeight = () => config.height || 300;
  const getChartWidth = () => config.width || 400;

  const renderLineChart = () => {
    if (!data || data.length === 0) return null;

    const width = getChartWidth();
    const height = getChartHeight();
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxValue = Math.max(...data.map(d => Number(d.value) || 0));
    const minValue = Math.min(...data.map(d => Number(d.value) || 0));
    const valueRange = maxValue - minValue;

    const points = data.map((d, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((Number(d.value) - minValue) / valueRange) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + ratio * chartHeight}
            x2={width - padding}
            y2={padding + ratio * chartHeight}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* Data line */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          points={points}
        />
        
        {/* Data points */}
        {data.map((d, index) => {
          const x = padding + (index / (data.length - 1)) * chartWidth;
          const y = padding + chartHeight - ((Number(d.value) - minValue) / valueRange) * chartHeight;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="#3b82f6"
            />
          );
        })}
        
        {/* Labels */}
        {data.map((d, index) => {
          const x = padding + (index / (data.length - 1)) * chartWidth;
          return (
            <text
              key={index}
              x={x}
              y={height - 10}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              {d.month || d.label || index + 1}
            </text>
          );
        })}
      </svg>
    );
  };

  const renderBarChart = () => {
    if (!data || data.length === 0) return null;

    const width = getChartWidth();
    const height = getChartHeight();
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxValue = Math.max(...data.map(d => Number(d.value) || Number(d.count) || 0));
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;

    return (
      <svg width={width} height={height} className="w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + ratio * chartHeight}
            x2={width - padding}
            y2={padding + ratio * chartHeight}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* Bars */}
        {data.map((d, index) => {
          const barHeight = ((Number(d.value) || Number(d.count) || 0) / maxValue) * chartHeight;
          const x = padding + index * (chartWidth / data.length) + barSpacing / 2;
          const y = padding + chartHeight - barHeight;
          
          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="#3b82f6"
              opacity="0.8"
            />
          );
        })}
        
        {/* Labels */}
        {data.map((d, index) => {
          const x = padding + index * (chartWidth / data.length) + chartWidth / data.length / 2;
          return (
            <text
              key={index}
              x={x}
              y={height - 10}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              {d.month || d.label || index + 1}
            </text>
          );
        })}
      </svg>
    );
  };

  const renderPieChart = () => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, d) => sum + (Number(d.value) || Number(d.count) || 0), 0);
    let currentAngle = 0;
    const radius = 80;
    const centerX = getChartWidth() / 2;
    const centerY = getChartHeight() / 2;

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
      <svg width={getChartWidth()} height={getChartHeight()} className="w-full">
        {data.map((d, index) => {
          const value = Number(d.value) || Number(d.count) || 0;
          const percentage = value / total;
          const angle = percentage * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          
          const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
          const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
          const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
          const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          currentAngle += angle;
          
          return (
            <path
              key={index}
              d={pathData}
              fill={colors[index % colors.length]}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
        
        {/* Labels */}
        {data.map((d, index) => {
          const value = Number(d.value) || Number(d.count) || 0;
          const percentage = (value / total * 100).toFixed(1);
          const angle = currentAngle - (data.slice(0, index + 1).reduce((sum, item) => 
            sum + (Number(item.value) || Number(item.count) || 0), 0) / total * 360) / 2;
          const labelX = centerX + (radius + 20) * Math.cos((angle - 90) * Math.PI / 180);
          const labelY = centerY + (radius + 20) * Math.sin((angle - 90) * Math.PI / 180);
          
          return (
            <text
              key={index}
              x={labelX}
              y={labelY}
              textAnchor="middle"
              className="text-xs fill-gray-700"
            >
              {d.label || d.name}: {percentage}%
            </text>
          );
        })}
      </svg>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      default:
        return (
          <div className="flex items-center justify-center h-full text-brand-text/60">
            Chart type not supported
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {config.title && (
        <h4 className="text-sm font-medium text-brand-text/80 mb-2">{config.title}</h4>
      )}
      <div className="w-full">
        {renderChart()}
      </div>
    </div>
  );
}
