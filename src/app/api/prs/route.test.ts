import { NextRequest } from 'next/server';
import { GET, POST } from './route';

// Mock the notification service
jest.mock('@/lib/notification-service', () => ({
  notificationService: {
    sendPRCreatedNotification: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock the authorization matrix
jest.mock('@/lib/authorization-matrix', () => ({
  getRequiredApprovalLevels: jest.fn().mockReturnValue([]),
  getApproversForLevel: jest.fn().mockReturnValue(['approver-001']),
}));

describe('/api/prs', () => {
  const createMockRequest = (body?: unknown, searchParams?: Record<string, string>) => {
    const url = new URL('http://localhost:3000/api/prs');
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    
    return {
      url: url.toString(),
      json: jest.fn().mockResolvedValue(body || {}),
    } as unknown as NextRequest;
  };

  describe('GET /api/prs', () => {
    it('should return PRs with default pagination', async () => {
      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('prs');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.prs)).toBe(true);
    });

    it('should filter PRs by project_id', async () => {
      const request = createMockRequest(undefined, { project_id: '1' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.prs).toBeDefined();
    });

    it('should filter PRs by supplier_id', async () => {
      const request = createMockRequest(undefined, { supplier_id: 'supplier-001' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.prs).toBeDefined();
    });

    it('should filter PRs by status', async () => {
      const request = createMockRequest(undefined, { status: 'draft' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.prs).toBeDefined();
    });

    it('should handle pagination parameters', async () => {
      const request = createMockRequest(undefined, { page: '2', limit: '5' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(5);
    });

    it('should handle API errors', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const request = createMockRequest();
      // Force an error by making the request invalid
      Object.defineProperty(request, 'url', {
        value: 'invalid-url',
        writable: false,
      });
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch PRs');
      
      consoleSpy.mockRestore();
    });
  });

  describe('POST /api/prs', () => {
    it('should create PRs from approved quote approval', async () => {
      const requestBody = {
        quote_approval_id: 'qa-001',
        project_id: '1'
      };
      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('pr_number');
      expect(data[0]).toHaveProperty('supplier_id');
    });

    it('should require quote_approval_id and project_id', async () => {
      const request = createMockRequest({ quote_approval_id: 'qa-001' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('quote_approval_id and project_id are required');
    });

    it('should handle missing quote_approval_id', async () => {
      const request = createMockRequest({ project_id: '1' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('quote_approval_id and project_id are required');
    });

    it('should handle missing project_id', async () => {
      const request = createMockRequest({ quote_approval_id: 'qa-001' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('quote_approval_id and project_id are required');
    });

    it('should group line items by supplier', async () => {
      const requestBody = {
        quote_approval_id: 'qa-001',
        project_id: '1'
      };
      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(Array.isArray(data)).toBe(true);
      
      // Each PR should have a unique supplier
      const supplierIds = data.map((pr: { supplier_id: string }) => pr.supplier_id);
      const uniqueSupplierIds = [...new Set(supplierIds)];
      expect(uniqueSupplierIds.length).toBe(supplierIds.length);
    });

    it('should handle API errors during PR creation', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const request = createMockRequest({ quote_approval_id: 'qa-001', project_id: '1' });
      // Force an error by making the request invalid
      Object.defineProperty(request, 'json', {
        value: jest.fn().mockRejectedValue(new Error('JSON parse error')),
        writable: false,
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create PRs');
      
      consoleSpy.mockRestore();
    });
  });
});
