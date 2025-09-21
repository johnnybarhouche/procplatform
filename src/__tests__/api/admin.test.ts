import { NextRequest } from 'next/server';
import { GET as getDashboard } from '@/app/api/admin/dashboard/route';
import { GET as getMRFields, POST as createMRField } from '@/app/api/admin/mr-fields/route';
import { GET as getAuthMatrix, POST as createAuthMatrix } from '@/app/api/admin/authorization-matrix/route';
import { GET as getCurrency, POST as createCurrency } from '@/app/api/admin/currency/route';
import { GET as getUsers, POST as createUser } from '@/app/api/admin/users/route';
import { GET as getIntegrations, POST as createIntegration } from '@/app/api/admin/integrations/route';
import { GET as getSettings, POST as createSetting } from '@/app/api/admin/settings/route';

// Mock NextRequest for testing
const mockRequest = (url: string, method: string, body?: Record<string, unknown>) => {
  const request = new Request(url, { method, body: body ? JSON.stringify(body) : undefined });
  return new NextRequest(request);
};

describe('Admin API Endpoints', () => {
  describe('Dashboard API', () => {
    it('should return dashboard data', async () => {
      const request = mockRequest('http://localhost:3000/api/admin/dashboard', 'GET');
      const response = await getDashboard(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('totalUsers');
      expect(data).toHaveProperty('activeIntegrations');
      expect(data).toHaveProperty('systemSettings');
      expect(data).toHaveProperty('recentActivity');
    });
  });

  describe('MR Fields API', () => {
    it('should return MR field configurations', async () => {
      const request = mockRequest('http://localhost:3000/api/admin/mr-fields', 'GET');
      const response = await getMRFields(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('field_name');
      expect(data[0]).toHaveProperty('field_label');
    });

    it('should create new MR field configuration', async () => {
      const newField = {
        field_name: 'test_field',
        field_label: 'Test Field',
        is_visible: true,
        is_required: false,
        display_order: 10,
        field_type: 'text',
        validation_rules: { maxLength: 100 }
      };

      const request = mockRequest('http://localhost:3000/api/admin/mr-fields', 'POST', newField);
      const response = await createMRField(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
      expect(data.field_name).toBe('test_field');
    });
  });

  describe('Authorization Matrix API', () => {
    it('should return authorization matrix', async () => {
      const request = mockRequest('http://localhost:3000/api/admin/authorization-matrix', 'GET');
      const response = await getAuthMatrix(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('role');
      expect(data[0]).toHaveProperty('threshold');
    });

    it('should create new authorization matrix entry', async () => {
      const newEntry = {
        role: 'approver',
        threshold: 5000,
        requires_approval: true,
        approval_roles: ['senior_approver']
      };

      const request = mockRequest('http://localhost:3000/api/admin/authorization-matrix', 'POST', newEntry);
      const response = await createAuthMatrix(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
      expect(data.role).toBe('approver');
    });
  });

  describe('Currency API', () => {
    it('should return currency configurations', async () => {
      const request = mockRequest('http://localhost:3000/api/admin/currency', 'GET');
      const response = await getCurrency(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('code');
      expect(data[0]).toHaveProperty('name');
    });

    it('should create new currency configuration', async () => {
      const newCurrency = {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        is_active: true,
        exchange_rate: 0.85
      };

      const request = mockRequest('http://localhost:3000/api/admin/currency', 'POST', newCurrency);
      const response = await createCurrency(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
      expect(data.code).toBe('EUR');
    });
  });

  describe('Users API', () => {
    it('should return users list', async () => {
      const request = mockRequest('http://localhost:3000/api/admin/users', 'GET');
      const response = await getUsers(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('name');
      expect(data[0]).toHaveProperty('email');
      expect(data[0]).toHaveProperty('role');
    });

    it('should create new user', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'requester',
        project_ids: ['proj-1'],
        is_active: true
      };

      const request = mockRequest('http://localhost:3000/api/admin/users', 'POST', newUser);
      const response = await createUser(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
      expect(data.name).toBe('Test User');
    });
  });

  describe('Integrations API', () => {
    it('should return integrations list', async () => {
      const request = mockRequest('http://localhost:3000/api/admin/integrations', 'GET');
      const response = await getIntegrations(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('integration_type');
      expect(data[0]).toHaveProperty('name');
    });

    it('should create new integration', async () => {
      const newIntegration = {
        integration_type: 'sso',
        name: 'Test SSO',
        configuration: { endpoint: 'https://sso.example.com' },
        is_active: true
      };

      const request = mockRequest('http://localhost:3000/api/admin/integrations', 'POST', newIntegration);
      const response = await createIntegration(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
      expect(data.integration_type).toBe('sso');
    });
  });

  describe('Settings API', () => {
    it('should return system settings', async () => {
      const request = mockRequest('http://localhost:3000/api/admin/settings', 'GET');
      const response = await getSettings(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('setting_key');
      expect(data[0]).toHaveProperty('setting_value');
    });

    it('should create new system setting', async () => {
      const newSetting = {
        setting_key: 'test_setting',
        setting_value: 'test_value',
        setting_type: 'string',
        description: 'Test setting',
        is_active: true
      };

      const request = mockRequest('http://localhost:3000/api/admin/settings', 'POST', newSetting);
      const response = await createSetting(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
      expect(data.setting_key).toBe('test_setting');
    });
  });
});
