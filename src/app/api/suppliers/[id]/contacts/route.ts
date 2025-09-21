import { NextRequest, NextResponse } from 'next/server';
import { SupplierContact } from '@/types/procurement';

// Mock database for supplier contacts
const supplierContacts: SupplierContact[] = [
  {
    id: '1',
    supplier_id: '1',
    name: 'Ahmed Al-Rashid',
    email: 'ahmed@abcconstruction.com',
    phone: '+971-4-123-4567',
    position: 'Sales Manager',
    is_primary: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    supplier_id: '1',
    name: 'Sara Al-Mansouri',
    email: 'sara@abcconstruction.com',
    phone: '+971-4-123-4568',
    position: 'Procurement Coordinator',
    is_primary: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    supplier_id: '2',
    name: 'Mohammed Hassan',
    email: 'mohammed@xyzelectrical.com',
    phone: '+971-4-234-5678',
    position: 'Procurement Director',
    is_primary: true,
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z'
  },
  {
    id: '4',
    supplier_id: '3',
    name: 'Fatima Al-Zahra',
    email: 'fatima@defindustrial.com',
    phone: '+971-4-345-6789',
    position: 'Business Development Manager',
    is_primary: true,
    created_at: '2025-01-18T00:00:00Z',
    updated_at: '2025-01-18T00:00:00Z'
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: supplierId } = await params;
    const contacts = supplierContacts.filter(c => c.supplier_id === supplierId);
    
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching supplier contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier contacts' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { contacts } = body;
    
    if (!Array.isArray(contacts)) {
      return NextResponse.json(
        { error: 'Contacts must be an array' },
        { status: 400 }
      );
    }

    // Validate contact data
    for (const contact of contacts) {
      if (!contact.name || !contact.email) {
        return NextResponse.json(
          { error: 'Contact name and email are required' },
          { status: 400 }
        );
      }
    }

    const { id: supplierId } = await params;
    
    // Remove existing contacts for this supplier
    const existingContacts = supplierContacts.filter(c => c.supplier_id === supplierId);
    const otherContacts = supplierContacts.filter(c => c.supplier_id !== supplierId);
    
    // Add new contacts
    const newContacts: SupplierContact[] = contacts.map((contact, index) => ({
      id: `${supplierId}-${Date.now()}-${index}`,
      supplier_id: supplierId,
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      position: contact.position || '',
      is_primary: contact.is_primary || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Update the contacts array
    const updatedContacts = [...otherContacts, ...newContacts];
    
    // Update the global array (in a real app, this would be a database operation)
    supplierContacts.length = 0;
    supplierContacts.push(...updatedContacts);

    return NextResponse.json({
      message: 'Supplier contacts updated successfully',
      contacts: newContacts
    });
  } catch (error) {
    console.error('Error updating supplier contacts:', error);
    return NextResponse.json(
      { error: 'Failed to update supplier contacts' },
      { status: 500 }
    );
  }
}
