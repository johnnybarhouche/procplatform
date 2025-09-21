import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';

// Mock fetch
global.fetch = jest.fn();

const mockKPIData = {
  totalPRs: 156,
  totalPOs: 89,
  totalValue: 2450000,
  avgResponseTime: 2.3,
  topSupplier: 'ABC Construction Supplies',
  monthlyTrends: [
    { month: '2024-01', prs: 12, pos: 8, value: 180000, responseRate: 0.85 },
    { month: '2024-02', prs: 15, pos: 11, value: 220000, responseRate: 0.88 }
  ]
};

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders the dashboard title', () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockKPIData })
    });

    render(<AnalyticsDashboard userRole="admin" />);
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    (fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    render(<AnalyticsDashboard userRole="admin" />);
    expect(screen.getByText('Loading analytics data...')).toBeInTheDocument();
  });

  it('displays KPI cards when data is loaded', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockKPIData })
    });

    render(<AnalyticsDashboard userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('Total PRs')).toBeInTheDocument();
      expect(screen.getByText('Total POs')).toBeInTheDocument();
      expect(screen.getByText('Total Value')).toBeInTheDocument();
      expect(screen.getByText('Avg Response Time')).toBeInTheDocument();
    });
  });

  it('displays error state when API fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<AnalyticsDashboard userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading analytics')).toBeInTheDocument();
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('handles refresh button click', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockKPIData })
    });

    render(<AnalyticsDashboard userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('Total PRs')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(fetch).toHaveBeenCalledTimes(2); // Initial load + refresh
  });

  it('handles export button click', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockKPIData })
    });

    // Mock blob and URL.createObjectURL
    const mockBlob = new Blob(['test'], { type: 'text/csv' });
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();

    render(<AnalyticsDashboard userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('Total PRs')).toBeInTheDocument();
    });

    const exportButton = screen.getByText('Export CSV');
    fireEvent.click(exportButton);

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/analytics/export'));
  });

  it('updates filters when date range changes', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockKPIData })
    });

    render(<AnalyticsDashboard userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('Total PRs')).toBeInTheDocument();
    });

    const startDateInput = screen.getByDisplayValue('2024-01-01');
    fireEvent.change(startDateInput, { target: { value: '2024-06-01' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('startDate=2024-06-01'));
    });
  });
});

