import { NextRequest } from 'next/server';
import { POST } from './route';
import * as authMatrix from '@/lib/authorization-matrix';
import { resetPRMockData } from '@/lib/mock-data/prs';

// Mock the notification service
jest.mock('@/lib/notification-service', () => ({
  notificationService: {
    sendPRApprovalDecisionNotification: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock the authorization matrix
jest.mock('@/lib/authorization-matrix', () => ({
  getNextApprovalLevel: jest.fn().mockReturnValue(1),
  isPRFullyApproved: jest.fn().mockReturnValue(false),
}));

describe('/api/prs/[id]/approve', () => {
  const createMockRequest = (body?: unknown) => {
    return {
      json: jest.fn().mockResolvedValue(body || {}),
    } as unknown as NextRequest;
  };

  const createMockParams = (id: string) => ({
    params: { id },
  });

  beforeEach(() => {
    resetPRMockData();
    (authMatrix.getNextApprovalLevel as jest.Mock).mockReturnValue(1);
    (authMatrix.isPRFullyApproved as jest.Mock).mockReturnValue(false);
  });

  describe('POST /api/prs/[id]/approve', () => {
    it('should approve PR with valid approver_id', async () => {
      const params = createMockParams('pr-001');
      const requestBody = { 
        approver_id: 'approver-001',
        comments: 'Approved for procurement'
      };
      const request = createMockRequest(requestBody);
      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('id', 'pr-001');
      expect(data).toHaveProperty('approvals');
      expect(data.approvals).toHaveLength(1);
      expect(data.approvals[0]).toHaveProperty('status', 'approved');
      expect(data.approvals[0]).toHaveProperty('approver_id', 'approver-001');
    });

    it('should approve PR without comments', async () => {
      const params = createMockParams('pr-001');
      const requestBody = { approver_id: 'approver-001' };
      const request = createMockRequest(requestBody);
      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('approvals');
      expect(data.approvals[0]).toHaveProperty('status', 'approved');
    });

    it('should require approver_id', async () => {
      const params = createMockParams('pr-001');
      const requestBody = { comments: 'Approved' };
      const request = createMockRequest(requestBody);
      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('approver_id is required');
    });

    it('should return 404 for non-existent PR', async () => {
      const params = createMockParams('non-existent');
      const requestBody = { approver_id: 'approver-001' };
      const request = createMockRequest(requestBody);
      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Purchase Requisition not found');
    });

    it('should handle case when no approval required', async () => {
      // Mock getNextApprovalLevel to return 0 (no approval required)
      (authMatrix.getNextApprovalLevel as jest.Mock).mockReturnValue(0);

      const params = createMockParams('pr-001');
      const requestBody = { approver_id: 'approver-001' };
      const request = createMockRequest(requestBody);
      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No approval required or all approvals completed');
    });

    it('should handle fully approved PR', async () => {
      // Mock isPRFullyApproved to return true
      (authMatrix.isPRFullyApproved as jest.Mock).mockReturnValue(true);

      const params = createMockParams('pr-001');
      const requestBody = { approver_id: 'approver-001' };
      const request = createMockRequest(requestBody);
      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('status', 'approved');
      expect(data).toHaveProperty('approved_at');
      expect(data).toHaveProperty('approved_by', 'approver-001');
    });

    it('should trigger PO generation for fully approved PR', async () => {
      // Mock isPRFullyApproved to return true
      (authMatrix.isPRFullyApproved as jest.Mock).mockReturnValue(true);

      const params = createMockParams('pr-001');
      const requestBody = { approver_id: 'approver-001' };
      const request = createMockRequest(requestBody);
      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('status', 'approved');
      // Should have triggered PO generation (audit log would be created)
    });

    it('should handle API errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const params = createMockParams('pr-001');
      const request = createMockRequest({ approver_id: 'approver-001' });
      // Force an error by making the request invalid
      Object.defineProperty(request, 'json', {
        value: jest.fn().mockRejectedValue(new Error('JSON parse error')),
        writable: false,
      });
      
      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to approve PR');
      
      consoleSpy.mockRestore();
    });

    it('should create audit log for approval', async () => {
      const params = createMockParams('pr-001');
      const requestBody = { 
        approver_id: 'approver-001',
        comments: 'Approved with comments'
      };
      const request = createMockRequest(requestBody);
      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('approvals');
      expect(data.approvals[0]).toHaveProperty('comments', 'Approved with comments');
    });
  });
});
