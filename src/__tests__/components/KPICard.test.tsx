import { render, screen, fireEvent } from '@testing-library/react';
import KPICard from '../../components/KPICard';

describe('KPICard', () => {
  it('renders KPI card with title and value', () => {
    render(
      <KPICard
        title="Total PRs"
        value={156}
        trend="up"
        change={12.5}
      />
    );

    expect(screen.getByText('Total PRs')).toBeInTheDocument();
    expect(screen.getByText('156')).toBeInTheDocument();
    expect(screen.getByText('12.5%')).toBeInTheDocument();
    expect(screen.getByText('vs last period')).toBeInTheDocument();
  });

  it('renders with string value', () => {
    render(
      <KPICard
        title="Total Value"
        value="$2.45M"
        trend="up"
        change={15.2}
      />
    );

    expect(screen.getByText('Total Value')).toBeInTheDocument();
    expect(screen.getByText('$2.45M')).toBeInTheDocument();
  });

  it('displays up trend with green color', () => {
    render(
      <KPICard
        title="Test Metric"
        value={100}
        trend="up"
        change={5.0}
      />
    );

    const trendElement = screen.getByText('5%');
    expect(trendElement).toHaveClass('text-green-600');
  });

  it('displays down trend with red color', () => {
    render(
      <KPICard
        title="Test Metric"
        value={100}
        trend="down"
        change={-3.0}
      />
    );

    const trendElement = screen.getByText('3%');
    expect(trendElement).toHaveClass('text-red-600');
  });

  it('displays neutral trend with gray color', () => {
    render(
      <KPICard
        title="Test Metric"
        value={100}
        trend="neutral"
        change={0}
      />
    );

    const trendElement = screen.getByText('0%');
    expect(trendElement).toHaveClass('text-gray-600');
  });

  it('handles click when onClick is provided', () => {
    const mockOnClick = jest.fn();
    render(
      <KPICard
        title="Clickable Metric"
        value={100}
        trend="up"
        change={5.0}
        onClick={mockOnClick}
      />
    );

    const card = screen.getByText('Clickable Metric').closest('div');
    fireEvent.click(card!);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('formats large numbers with commas', () => {
    render(
      <KPICard
        title="Large Number"
        value={1234567}
        trend="up"
        change={5.0}
      />
    );

    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('renders with icon when provided', () => {
    const mockIcon = <span data-testid="test-icon">📊</span>;
    render(
      <KPICard
        title="Test Metric"
        value={100}
        trend="up"
        change={5.0}
        icon={mockIcon}
      />
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
});

