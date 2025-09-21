import { GET, POST } from '../route'
import { NextRequest } from 'next/server'

describe('/api/items', () => {
  describe('GET', () => {
    it('returns list of items', async () => {
      const request = new NextRequest('http://localhost:3000/api/items')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })

    it('supports search parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/items?search=test')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('POST', () => {
    it('creates a new item', async () => {
      const newItem = {
        item_code: 'TEST-001',
        description: 'Test Item',
        category: 'Test Category',
        uom: 'EA',
        brand: 'Test Brand',
        model: 'Test Model'
      }

      const request = new NextRequest('http://localhost:3000/api/items', {
        method: 'POST',
        body: JSON.stringify(newItem),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.item_code).toBe('TEST-001')
      expect(data.description).toBe('Test Item')
    })

    it('validates required fields', async () => {
      const incompleteItem = {
        item_code: 'TEST-002'
        // Missing required fields
      }

      const request = new NextRequest('http://localhost:3000/api/items', {
        method: 'POST',
        body: JSON.stringify(incompleteItem),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })
  })
})

