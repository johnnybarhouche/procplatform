import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from '@/components/AdminDashboard';
import MRFieldConfiguration from '@/components/MRFieldConfiguration';
import AuthorizationMatrixManager from '@/components/AuthorizationMatrixManager';
import CurrencyConfiguration from '@/components/CurrencyConfiguration';
import UserManagement from '@/components/UserManagement';
import IntegrationManagement from '@/components/IntegrationManagement';
import SystemSettings from '@/components/SystemSettings';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock data for API responses
const mockDashboardData = {
  totalUsers: 5,
  activeIntegrations: 2,
  systemSettings: 8,
  system_health: 'healthy',
  recentActivity: []
};

const mockMRFields = [
  {
    id: '1',
    field_name: 'description',
    field_label: 'Description',
    is_visible: true,
    is_required: true,
    display_order: 1,
    field_type: 'text',
    validation_rules: { maxLength: 500 },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockAuthMatrix = [
  {
    id: '1',
    role: 'requester',
    threshold: 1000,
    requires_approval: false,
    approval_roles: [],
    approval_level: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockCurrencyConfig = {
  id: '1',
  base_currency: 'USD',
  supported_currencies: ['USD', 'EUR', 'GBP'],
  exchange_rates: { EUR: 0.85, GBP: 0.73 },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const mockUsers = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'requester',
    project_ids: ['proj-1'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockIntegrations = [
  {
    id: '1',
    integration_type: 'sso',
    name: 'Test SSO',
    configuration: { endpoint: 'https://sso.example.com' },
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockSettings = [
  {
    id: '1',
    setting_key: 'test_setting',
    setting_value: 'test_value',
    setting_type: 'string',
    description: 'Test setting',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

describe('Admin Components', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('AdminDashboard', () => {
    it('should render admin dashboard with all tabs', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboardData
      });

      await act(async () => {
        render(<AdminDashboard userRole="admin" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('MR Fields')).toBeInTheDocument();
        expect(screen.getByText('Authorization')).toBeInTheDocument();
        expect(screen.getByText('Currency')).toBeInTheDocument();
        expect(screen.getByText('User Management')).toBeInTheDocument();
        expect(screen.getByText('System Settings')).toBeInTheDocument();
        expect(screen.getByText('Integrations')).toBeInTheDocument();
      });
    });

    it('should switch between tabs', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboardData
      });

      await act(async () => {
        render(<AdminDashboard userRole="admin" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });

      // Click on MR Fields tab
      fireEvent.click(screen.getByText('MR Fields'));
      await waitFor(() => {
        expect(screen.getByText('MR Field Configuration')).toBeInTheDocument();
      });

      // Click on User Management tab
      fireEvent.click(screen.getByText('User Management'));
      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
      });
    });
  });

  describe('MRFieldConfiguration', () => {
    it('should render MR field configuration form', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMRFields
      });

      await act(async () => {
        render(<MRFieldConfiguration userRole="admin" />);
      });

      await waitFor(() => {
        expect(screen.getByText('MR Field Configuration')).toBeInTheDocument();
        expect(screen.getByText('Add New Field')).toBeInTheDocument();
      });
    });

    it('should open add field modal', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMRFields
      });

      await act(async () => {
        render(<MRFieldConfiguration userRole="admin" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Add New Field')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add New Field'));
      expect(screen.getByText('Add MR Field')).toBeInTheDocument();
    });
  });

  describe('AuthorizationMatrixManager', () => {
    it('should render authorization matrix', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthMatrix
      });

      await act(async () => {
        render(<AuthorizationMatrixManager userRole="admin" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Authorization Matrix')).toBeInTheDocument();
        expect(screen.getByText('Add New Rule')).toBeInTheDocument();
      });
    });

    it('should open add rule modal', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthMatrix
      });

      await act(async () => {
        render(<AuthorizationMatrixManager userRole="admin" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Add New Rule')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add New Rule'));
      expect(screen.getByText('Add Authorization Rule')).toBeInTheDocument();
    });
  });

  describe('CurrencyConfiguration', () => {
    it('should render currency configuration', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCurrencyConfig
      });

      await act(async () => {
        render(<CurrencyConfiguration userRole="admin" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Currency Configuration')).toBeInTheDocument();
        expect(screen.getByText('Add New Currency')).toBeInTheDocument();
      });
    });

    it('should open add currency modal', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCurrencyConfig
      });

      await act(async () => {
        render(<CurrencyConfiguration userRole="admin" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Add New Currency')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add New Currency'));
      expect(screen.getByText('Add Currency')).toBeInTheDocument();
    });
  });

  describe('UserManagement', () => {
    it('should render user management interface', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers
      });

      await act(async () => {
        render(<UserManagement userRole="admin" />);
      });

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
        expect(screen.getByText('Add New User')).toBeInTheDocument();
      });
    });

    it('should open add user modal', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers
      });

      await act(async () => {
        render(<UserManagement userRole="admin" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Add New User')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add New User'));
      expect(screen.getByText('Create User')).toBeInTheDocument();
    });
  });

  describe('IntegrationManagement', () => {
    it('should render integration management interface', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockIntegrations
      });

      await act(async () => {
        render(<IntegrationManagement userRole="admin" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Integration Management')).toBeInTheDocument();
        expect(screen.getByText('Add New Integration')).toBeInTheDocument();
      });
    });

    it('should open add integration modal', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockIntegrations
      });

      await act(async () => {
        render(<IntegrationManagement userRole="admin" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Add New Integration')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add New Integration'));
      expect(screen.getByText('Create Integration')).toBeInTheDocument();
    });
  });

  describe('SystemSettings', () => {
    it('should render system settings interface', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings
      });

      await act(async () => {
        render(<SystemSettings userRole="admin" />);
      });

      await waitFor(() => {
        expect(screen.getByText('System Settings')).toBeInTheDocument();
        expect(screen.getByText('Add New Setting')).toBeInTheDocument();
      });
    });

    it('should open add setting modal', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings
      });

      await act(async () => {
        render(<SystemSettings userRole="admin" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Add New Setting')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add New Setting'));
      expect(screen.getByText('Create Setting')).toBeInTheDocument();
    });
  });
});
