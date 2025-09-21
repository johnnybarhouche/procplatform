import { render, screen } from '@testing-library/react'
import ItemMasterDashboard from '../ItemMasterDashboard'

// Mock fetch
global.fetch = jest.fn()

describe('ItemMasterDashboard', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: '1',
          item_code: 'ITEM-001',
          description: 'Test Item',
          category: 'Test Category',
          uom: 'EA',
          brand: 'Test Brand',
          model: 'Test Model',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          created_by: 'user-1'
        }
      ]
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the item dashboard', () => {
    render(<ItemMasterDashboard userRole="admin" />)
    
    expect(screen.getByText('Item Master Database')).toBeInTheDocument()
    expect(screen.getByText('Add New Item')).toBeInTheDocument()
  })

  it('displays search functionality', () => {
    render(<ItemMasterDashboard userRole="admin" />)
    
    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument()
  })

  it('shows add item button for admin users', () => {
    render(<ItemMasterDashboard userRole="admin" />)
    
    expect(screen.getByText('Add New Item')).toBeInTheDocument()
  })
})

