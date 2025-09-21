import { NextRequest } from 'next/server';
import { GET, POST } from './route';

// Mock the notification service
jest.mock('@/lib/notification-service', () => ({
  notificationService: {
    sendPOCreatedNotification: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('/api/pos', () => {
  describe('GET', () => {
    it('should return POs with pagination', async () => {
      const request = new NextRequest('http://localhost:3000/api/pos');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('pos');
      expect(data).toHaveProperty('pagination');
      expect(data.pagination).toHaveProperty('currentPage');
      expect(data.pagination).toHaveProperty('totalPages');
      expect(data.pagination).toHaveProperty('totalItems');
    });

    it('should filter POs by project_id', async () => {
      const request = new NextRequest('http://localhost:3000/api/pos?project_id=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pos).toBeDefined();
    });

    it('should filter POs by status', async () => {
      const request = new NextRequest('http://localhost:3000/api/pos?status=draft');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pos).toBeDefined();
    });

    it('should handle pagination parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/pos?page=1&limit=5');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.currentPage).toBe(1);
    });
  });

  describe('POST', () => {
    it('should generate POs from approved PR', async () => {
      const requestBody = {
        pr_id: 'pr-001',
        project_id: '1'
      };

      const request = new NextRequest('http://localhost:3000/api/pos', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('po_number');
      expect(data[0]).toHaveProperty('project_id', '1');
      expect(data[0]).toHaveProperty('supplier_id');
      expect(data[0]).toHaveProperty('status', 'draft');
    });

    it('should return 400 if pr_id is missing', async () => {
      const requestBody = {
        project_id: '1'
      };

      const request = new NextRequest('http://localhost:3000/api/pos', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('pr_id and project_id are required');
    });

    it('should return 400 if project_id is missing', async () => {
      const requestBody = {
        pr_id: 'pr-001'
      };

      const request = new NextRequest('http://localhost:3000/api/pos', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('pr_id and project_id are required');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/pos', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });
});

