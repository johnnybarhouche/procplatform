import { render, screen } from '@testing-library/react';
import AnalyticsChart from '../../components/AnalyticsChart';

const mockData = [
  { month: '2024-01', value: 100, count: 5 },
  { month: '2024-02', value: 150, count: 8 },
  { month: '2024-03', value: 200, count: 12 }
];

describe('AnalyticsChart', () => {
  it('renders line chart with data', () => {
    render(
      <AnalyticsChart
        data={mockData}
        type="line"
        config={{
          title: 'Test Line Chart',
          xAxis: 'month',
          yAxis: 'value',
          height: 300
        }}
      />
    );

    expect(screen.getByText('Test Line Chart')).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // SVG element
  });

  it('renders bar chart with data', () => {
    render(
      <AnalyticsChart
        data={mockData}
        type="bar"
        config={{
          title: 'Test Bar Chart',
          xAxis: 'month',
          yAxis: 'value',
          height: 300
        }}
      />
    );

    expect(screen.getByText('Test Bar Chart')).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // SVG element
  });

  it('renders pie chart with data', () => {
    const pieData = [
      { label: 'Category A', value: 30 },
      { label: 'Category B', value: 50 },
      { label: 'Category C', value: 20 }
    ];

    render(
      <AnalyticsChart
        data={pieData}
        type="pie"
        config={{
          title: 'Test Pie Chart',
          height: 300
        }}
      />
    );

    expect(screen.getByText('Test Pie Chart')).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // SVG element
  });

  it('handles empty data gracefully', () => {
    render(
      <AnalyticsChart
        data={[]}
        type="line"
        config={{
          title: 'Empty Chart',
          xAxis: 'month',
          yAxis: 'value',
          height: 300
        }}
      />
    );

    expect(screen.getByText('Empty Chart')).toBeInTheDocument();
  });

  it('renders without title when not provided', () => {
    render(
      <AnalyticsChart
        data={mockData}
        type="line"
        config={{
          xAxis: 'month',
          yAxis: 'value',
          height: 300
        }}
      />
    );

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // SVG element
  });

  it('handles unsupported chart type', () => {
    render(
      <AnalyticsChart
        data={mockData}
        type="area" as any
        config={{
          title: 'Unsupported Chart',
          xAxis: 'month',
          yAxis: 'value',
          height: 300
        }}
      />
    );

    expect(screen.getByText('Chart type not supported')).toBeInTheDocument();
  });

  it('applies custom height and width', () => {
    render(
      <AnalyticsChart
        data={mockData}
        type="line"
        config={{
          title: 'Custom Size Chart',
          xAxis: 'month',
          yAxis: 'value',
          height: 400,
          width: 600
        }}
      />
    );

    expect(screen.getByText('Custom Size Chart')).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // SVG element
  });
});

