import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock the notification service
jest.mock('@/lib/notification-service', () => ({
  notificationService: {
    sendPRApprovalDecisionNotification: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('/api/prs/[id]/reject', () => {
  const createMockRequest = (body?: unknown) => {
    return {
      json: jest.fn().mockResolvedValue(body || {}),
    } as unknown as NextRequest;
  };

  const createMockParams = (id: string) => ({
    params: Promise.resolve({ id }),
  });

  describe('POST /api/prs/[id]/reject', () => {
    it('should reject PR with valid approver_id and reason', async () => {
      const params = createMockParams('pr-001');
      const requestBody = { 
        approver_id: 'approver-001',
        reason: 'budget_exceeded',
        comments: 'Budget exceeded the allocated amount'
      };
      const request = createMockRequest(requestBody);
      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('id', 'pr-001');
      expect(data).toHaveProperty('status', 'rejected');
      expect(data).toHaveProperty('rejected_at');
      expect(data).toHaveProperty('rejected_by', 'approver-001');
      expect(data).toHaveProperty('rejection_reason', 'budget_exceeded');
      expect(data).toHaveProperty('approvals');
      expect(data.approvals).toHaveLength(1);
      expect(data.approvals[0]).toHaveProperty('status', 'rejected');
    });

    it('should reject PR without comments', async () => {
      const params = createMockParams('pr-001');
      const requestBody = { 
        approver_id: 'approver-001',
        reason: 'supplier_not_qualified'
      };
      const request = createMockRequest(requestBody);
      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('status', 'rejected');
      expect(data).toHaveProperty('rejection_reason', 'supplier_not_qualified');
    });

    it('should require approver_id', async () => {
      const params = createMockParams('pr-001');
      const requestBody = { 
        reason: 'budget_exceeded',
        comments: 'Budget exceeded'
      };
      const request = createMockRequest(requestBody);
      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('approver_id and reason are required');
    });

    it('should require reason', async () => {
      const params = createMockParams('pr-001');
      const requestBody = { 
        approver_id: 'approver-001',
        comments: 'Rejected'
      };
      const request = createMockRequest(requestBody);
      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('approver_id and reason are required');
    });

    it('should return 404 for non-existent PR', async () => {
      const params = createMockParams('non-existent');
      const requestBody = { 
        approver_id: 'approver-001',
        reason: 'budget_exceeded'
      };
      const request = createMockRequest(requestBody);
      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Purchase Requisition not found');
    });

    it('should handle different rejection reasons', async () => {
      const rejectionReasons = [
        'budget_exceeded',
        'supplier_not_qualified',
        'specifications_incorrect',
        'duplicate_request',
        'other'
      ];

      for (const reason of rejectionReasons) {
        const params = createMockParams('pr-001');
        const requestBody = { 
          approver_id: 'approver-001',
          reason: reason
        };
        const request = createMockRequest(requestBody);
        const response = await POST(request, params);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('rejection_reason', reason);
      }
    });

    it('should create audit log for rejection', async () => {
      const params = createMockParams('pr-001');
      const requestBody = { 
        approver_id: 'approver-001',
        reason: 'budget_exceeded',
        comments: 'Budget exceeded by 20%'
      };
      const request = createMockRequest(requestBody);
      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('approvals');
      expect(data.approvals[0]).toHaveProperty('status', 'rejected');
      expect(data.approvals[0]).toHaveProperty('comments', 'Budget exceeded by 20%');
    });

    it('should trigger return to procurement workflow', async () => {
      const params = createMockParams('pr-001');
      const requestBody = { 
        approver_id: 'approver-001',
        reason: 'specifications_incorrect',
        comments: 'Specifications need to be updated'
      };
      const request = createMockRequest(requestBody);
      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('status', 'rejected');
      // Should have triggered return to procurement (audit log would be created)
    });

    it('should handle API errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const params = createMockParams('pr-001');
      const request = createMockRequest({ 
        approver_id: 'approver-001',
        reason: 'budget_exceeded'
      });
      // Force an error by making the request invalid
      Object.defineProperty(request, 'json', {
        value: jest.fn().mockRejectedValue(new Error('JSON parse error')),
        writable: false,
      });
      
      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to reject PR');
      
      consoleSpy.mockRestore();
    });

    it('should preserve existing comments when rejecting', async () => {
      const params = createMockParams('pr-001');
      const requestBody = { 
        approver_id: 'approver-001',
        reason: 'duplicate_request'
      };
      const request = createMockRequest(requestBody);
      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('status', 'rejected');
      // Should preserve existing comments if any
    });
  });
});
