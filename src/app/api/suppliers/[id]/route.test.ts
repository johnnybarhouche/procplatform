import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from './route';

describe('/api/suppliers/[id]', () => {
  describe('GET', () => {
    it('returns supplier by id', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers/1');
      const response = await GET(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('1');
      expect(data.name).toBe('ABC Construction Supplies');
    });

    it('returns 404 for non-existent supplier', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers/999');
      const response = await GET(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Supplier not found');
    });
  });

  describe('PUT', () => {
    it('updates supplier information', async () => {
      const updateData = {
        name: 'Updated Supplier Name',
        email: 'updated@supplier.com',
        phone: '+971-4-999-9999',
        address: 'Updated Address',
        category: 'Updated Category'
      };

      const request = new NextRequest('http://localhost:3000/api/suppliers/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PUT(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Updated Supplier Name');
      expect(data.email).toBe('updated@supplier.com');
      expect(data.phone).toBe('+971-4-999-9999');
      expect(data.address).toBe('Updated Address');
      expect(data.category).toBe('Updated Category');
      expect(data.id).toBe('1'); // ID should not change
      expect(data.updated_at).toBeDefined();
    });

    it('returns 404 for non-existent supplier', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const request = new NextRequest('http://localhost:3000/api/suppliers/999', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PUT(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Supplier not found');
    });

    it('handles invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers/1', {
        method: 'PUT',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PUT(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update supplier');
    });
  });

  describe('DELETE', () => {
    it('soft deletes supplier', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers/1', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Supplier deactivated successfully');
      expect(data.supplier.is_active).toBe(false);
      expect(data.supplier.status).toBe('inactive');
      expect(data.supplier.updated_at).toBeDefined();
    });

    it('returns 404 for non-existent supplier', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers/999', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Supplier not found');
    });
  });
});

