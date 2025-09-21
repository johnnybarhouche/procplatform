import { NextRequest } from 'next/server';
import { GET, POST } from './route';

// Mock the suppliers array
const mockSuppliers = [
  {
    id: '1',
    name: 'ABC Construction Supplies',
    email: 'quotes@abcconstruction.com',
    phone: '+971-4-123-4567',
    address: 'Dubai, UAE',
    category: 'Construction Materials',
    rating: 4.5,
    quote_count: 25,
    avg_response_time: 24,
    last_quote_date: '2025-01-15',
    is_active: true,
    status: 'approved',
    approval_date: '2025-01-01',
    approved_by: 'user1',
    approved_by_name: 'John Smith',
    approval_notes: 'All compliance documents verified',
    contacts: [],
    performance_metrics: {
      id: '1',
      supplier_id: '1',
      total_quotes: 25,
      successful_quotes: 20,
      avg_response_time_hours: 24,
      on_time_delivery_rate: 95.0,
      quality_rating: 4.5,
      communication_rating: 4.3,
      last_updated: '2025-01-15T00:00:00Z'
    },
    compliance_docs: [],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
    created_by: 'user1',
    created_by_name: 'John Smith'
  },
  {
    id: '2',
    name: 'XYZ Electrical Solutions',
    email: 'procurement@xyzelectrical.com',
    phone: '+971-4-234-5678',
    address: 'Abu Dhabi, UAE',
    category: 'Electrical Equipment',
    rating: 4.2,
    quote_count: 18,
    avg_response_time: 36,
    last_quote_date: '2025-01-10',
    is_active: true,
    status: 'pending',
    contacts: [],
    performance_metrics: {
      id: '2',
      supplier_id: '2',
      total_quotes: 18,
      successful_quotes: 15,
      avg_response_time_hours: 36,
      on_time_delivery_rate: 88.0,
      quality_rating: 4.2,
      communication_rating: 4.0,
      last_updated: '2025-01-10T00:00:00Z'
    },
    compliance_docs: [],
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
    created_by: 'user2',
    created_by_name: 'Sarah Johnson'
  }
];

describe('/api/suppliers', () => {
  describe('GET', () => {
    it('returns all suppliers without filters', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suppliers).toHaveLength(2);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      });
    });

    it('filters suppliers by category', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers?category=Construction Materials');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suppliers).toHaveLength(1);
      expect(data.suppliers[0].category).toBe('Construction Materials');
    });

    it('filters suppliers by status', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers?status=approved');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suppliers).toHaveLength(1);
      expect(data.suppliers[0].status).toBe('approved');
    });

    it('filters suppliers by active status', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers?is_active=true');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suppliers).toHaveLength(2);
      expect(data.suppliers.every(s => s.is_active)).toBe(true);
    });

    it('searches suppliers by name', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers?search=ABC');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suppliers).toHaveLength(1);
      expect(data.suppliers[0].name).toBe('ABC Construction Supplies');
    });

    it('applies pagination', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers?page=1&limit=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suppliers).toHaveLength(1);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 1,
        total: 2,
        totalPages: 2
      });
    });

    it('handles multiple filters', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers?category=Construction Materials&status=approved');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suppliers).toHaveLength(1);
      expect(data.suppliers[0].category).toBe('Construction Materials');
      expect(data.suppliers[0].status).toBe('approved');
    });
  });

  describe('POST', () => {
    it('creates a new supplier', async () => {
      const newSupplier = {
        name: 'New Supplier',
        email: 'new@supplier.com',
        phone: '+971-4-999-9999',
        address: 'New Address',
        category: 'New Category',
        contacts: [],
        created_by: 'user1',
        created_by_name: 'Test User'
      };

      const request = new NextRequest('http://localhost:3000/api/suppliers', {
        method: 'POST',
        body: JSON.stringify(newSupplier),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('New Supplier');
      expect(data.email).toBe('new@supplier.com');
      expect(data.status).toBe('pending');
      expect(data.contacts).toEqual([]);
      expect(data.performance_metrics).toBeDefined();
    });

    it('creates supplier with default values', async () => {
      const newSupplier = {
        name: 'Minimal Supplier',
        email: 'minimal@supplier.com',
        category: 'Minimal Category'
      };

      const request = new NextRequest('http://localhost:3000/api/suppliers', {
        method: 'POST',
        body: JSON.stringify(newSupplier),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.rating).toBe(0);
      expect(data.quote_count).toBe(0);
      expect(data.avg_response_time).toBe(0);
      expect(data.is_active).toBe(true);
      expect(data.status).toBe('pending');
    });

    it('handles invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create supplier');
    });
  });
});