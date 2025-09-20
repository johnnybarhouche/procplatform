import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProcurementDashboard from './ProcurementDashboard';

// Mock fetch
global.fetch = jest.fn();

describe('ProcurementDashboard', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders procurement dashboard with correct title', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) });

    render(<ProcurementDashboard userRole="procurement" />);

    await waitFor(() => {
      expect(screen.getByText('Procurement Dashboard')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) });

    render(<ProcurementDashboard userRole="procurement" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders supplier suggestions panel', async () => {
    const mockSuppliers = [
      {
        id: '1',
        name: 'Test Supplier',
        email: 'test@supplier.com',
        category: 'Test Category',
        rating: 4.5,
        quote_count: 10,
        avg_response_time: 24,
        last_quote_date: '2025-01-20',
        is_active: true,
        compliance_docs: []
      }
    ];

    (fetch as jest.Mock)
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockSuppliers) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) });

    render(<ProcurementDashboard userRole="procurement" />);

    await waitFor(() => {
      expect(screen.getByText('Supplier Suggestions')).toBeInTheDocument();
      expect(screen.getByText('Test Supplier')).toBeInTheDocument();
    });
  });

  it('handles fetch errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

    render(<ProcurementDashboard userRole="procurement" />);

    await waitFor(() => {
      expect(screen.getByText('Procurement Dashboard')).toBeInTheDocument();
    });
  });
});
