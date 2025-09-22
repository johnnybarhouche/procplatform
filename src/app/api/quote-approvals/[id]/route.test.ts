import { NextRequest } from 'next/server';
import { GET, POST, PUT } from './route';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

describe('/api/quote-approvals/[id]', () => {
  describe('GET', () => {
    it('should return quote approval by id', async () => {
    const response = await GET({} as NextRequest, { params: { id: 'qa-rfq-1001' } });
      
      expect(response.data).toBeDefined();
    });

    it('should return 404 for non-existent approval', async () => {
      const response = await GET({} as NextRequest, { params: { id: 'non-existent' } });
      
      expect(response.status).toBe(404);
    });
  });

  describe('POST', () => {
    it('should submit approval decision', async () => {
    const requestBody = {
      decision: 'approved',
      line_item_decisions: [
        {
          mr_line_item_id: 'mr-line-1',
          selected_quote_id: 'quote-sup-1',
          decision: 'approved',
          comments: 'Good price'
        },
        {
          mr_line_item_id: 'mr-line-2',
          selected_quote_id: 'quote-sup-1',
          decision: 'approved',
        },
        {
          mr_line_item_id: 'mr-line-3',
          selected_quote_id: 'quote-sup-1',
          decision: 'approved',
        },
      ],
      comments: 'Approved for procurement'
    };

      const request = {
        json: async () => requestBody
      } as NextRequest;

      const response = await POST(request, { params: { id: 'qa-rfq-1001' } });
      
      expect(response.data).toBeDefined();
      expect(response.data.status).toBe('approved');
    });

    it('should handle rejection decision', async () => {
      const requestBody = {
        decision: 'rejected',
        line_item_decisions: [
          {
            mr_line_item_id: 'mr-line-1',
            selected_quote_id: '',
            decision: 'rejected',
            comments: 'Price too high'
          }
        ],
        comments: 'Rejected - prices exceed budget'
      };

      const request = {
        json: async () => requestBody
      } as NextRequest;

      const response = await POST(request, { params: { id: 'qa-001' } });
      
      expect(response.data).toBeDefined();
      expect(response.data.status).toBe('rejected');
    });

    it('should return 404 for non-existent approval', async () => {
      const requestBody = {
        decision: 'approved',
        line_item_decisions: [],
        comments: 'Test'
      };

      const request = {
        json: async () => requestBody
      } as NextRequest;

      const response = await POST(request, { params: { id: 'non-existent' } });
      
      expect(response.status).toBe(404);
    });
  });

  describe('PUT', () => {
    it('should update approval', async () => {
      const requestBody = {
        line_item_decisions: [
          {
            mr_line_item_id: 'mr-line-1',
            selected_quote_id: 'quote-sup-1',
            decision: 'approved',
            comments: 'Updated decision'
          }
        ],
        comments: 'Updated comments'
      };

      const request = {
        json: async () => requestBody
      } as NextRequest;

      const response = await PUT(request, { params: { id: 'qa-rfq-1001' } });
      
      expect(response.data).toBeDefined();
    });

    it('should return 404 for non-existent approval', async () => {
      const requestBody = {
        line_item_decisions: [],
        comments: 'Test'
      };

      const request = {
        json: async () => requestBody
      } as NextRequest;

      const response = await PUT(request, { params: { id: 'non-existent' } });
      
      expect(response.status).toBe(404);
    });
  });
});
