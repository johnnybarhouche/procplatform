import { NextRequest } from 'next/server';
import { POST } from './route';

describe('/api/suppliers/[id]/approve', () => {
  describe('POST', () => {
    it('approves a pending supplier', async () => {
      const approvalData = {
        approved_by: 'approver1',
        approval_notes: 'All compliance documents verified and financial stability confirmed'
      };

      const request = new NextRequest('http://localhost:3000/api/suppliers/3', {
        method: 'POST',
        body: JSON.stringify(approvalData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request, { params: { id: '3' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Supplier approved successfully');
      expect(data.supplier.status).toBe('approved');
      expect(data.supplier.approved_by).toBe('approver1');
      expect(data.supplier.approval_notes).toBe('All compliance documents verified and financial stability confirmed');
      expect(data.supplier.approval_date).toBeDefined();
    });

    it('returns 400 for already approved supplier', async () => {
      const approvalData = {
        approved_by: 'approver1',
        approval_notes: 'Trying to approve again'
      };

      const request = new NextRequest('http://localhost:3000/api/suppliers/1', {
        method: 'POST',
        body: JSON.stringify(approvalData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Supplier is already approved');
    });

    it('returns 404 for non-existent supplier', async () => {
      const approvalData = {
        approved_by: 'approver1',
        approval_notes: 'Approval notes'
      };

      const request = new NextRequest('http://localhost:3000/api/suppliers/999', {
        method: 'POST',
        body: JSON.stringify(approvalData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Supplier not found');
    });

    it('handles invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers/3', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request, { params: { id: '3' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to approve supplier');
    });

    it('approves supplier with minimal data', async () => {
      const approvalData = {
        approved_by: 'approver2'
      };

      const request = new NextRequest('http://localhost:3000/api/suppliers/3', {
        method: 'POST',
        body: JSON.stringify(approvalData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request, { params: { id: '3' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.supplier.status).toBe('approved');
      expect(data.supplier.approved_by).toBe('approver2');
      expect(data.supplier.approval_notes).toBeUndefined();
    });
  });
});
