import { NextRequest } from 'next/server';
import { GET, PUT } from './route';

// Mock the notification service
jest.mock('@/lib/notification-service', () => ({
  notificationService: {
    sendPRStatusChangeNotification: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('/api/prs/[id]', () => {
  const createMockRequest = (body?: unknown) => {
    return {
      json: jest.fn().mockResolvedValue(body || {}),
    } as unknown as NextRequest;
  };

  const createMockParams = (id: string) => ({
    params: Promise.resolve({ id }),
  });

  describe('GET /api/prs/[id]', () => {
    it('should return PR details for valid ID', async () => {
      const params = createMockParams('pr-001');
      const request = createMockRequest();
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('id', 'pr-001');
      expect(data).toHaveProperty('pr_number');
      expect(data).toHaveProperty('supplier');
    });

    it('should return 404 for non-existent PR', async () => {
      const params = createMockParams('non-existent');
      const request = createMockRequest();
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Purchase Requisition not found');
    });

    it('should handle API errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const params = createMockParams('pr-001');
      const request = createMockRequest();
      // Force an error by making the request invalid
      Object.defineProperty(request, 'json', {
        value: jest.fn().mockRejectedValue(new Error('JSON parse error')),
        writable: false,
      });
      
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch PR');
      
      consoleSpy.mockRestore();
    });
  });

  describe('PUT /api/prs/[id]', () => {
    it('should update PR status', async () => {
      const params = createMockParams('pr-001');
      const requestBody = { status: 'submitted' };
      const request = createMockRequest(requestBody);
      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('status', 'submitted');
      expect(data).toHaveProperty('updated_at');
    });

    it('should update PR comments', async () => {
      const params = createMockParams('pr-001');
      const requestBody = { comments: 'Updated comments' };
      const request = createMockRequest(requestBody);
      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('comments', 'Updated comments');
    });

    it('should update both status and comments', async () => {
      const params = createMockParams('pr-001');
      const requestBody = { 
        status: 'under_review', 
        comments: 'Under review comments' 
      };
      const request = createMockRequest(requestBody);
      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('status', 'under_review');
      expect(data).toHaveProperty('comments', 'Under review comments');
    });

    it('should return 404 for non-existent PR', async () => {
      const params = createMockParams('non-existent');
      const requestBody = { status: 'submitted' };
      const request = createMockRequest(requestBody);
      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Purchase Requisition not found');
    });

    it('should handle partial updates', async () => {
      const params = createMockParams('pr-001');
      const requestBody = { status: 'approved' };
      const request = createMockRequest(requestBody);
      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('status', 'approved');
      // Should preserve existing comments if not provided
      expect(data).toHaveProperty('comments');
    });

    it('should handle API errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const params = createMockParams('pr-001');
      const request = createMockRequest({ status: 'submitted' });
      // Force an error by making the request invalid
      Object.defineProperty(request, 'json', {
        value: jest.fn().mockRejectedValue(new Error('JSON parse error')),
        writable: false,
      });
      
      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update PR');
      
      consoleSpy.mockRestore();
    });
  });
});
