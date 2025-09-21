import { NextRequest, NextResponse } from 'next/server';
import { Item } from '@/types/procurement';

// Mock database for items (in a real app, this would be a database)
const items: Item[] = [];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Parse CSV file
    const csvText = await file.text();
    const lines = csvText.split('\n');
    // const headers = lines[0].split(',').map(h => h.trim());
    
    const importedItems: Item[] = [];
    const errors: string[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      
      try {
        const item: Item = {
          id: (items.length + importedItems.length + 1).toString(),
          item_code: values[0] || `ITM-${String(items.length + importedItems.length + 1).padStart(3, '0')}`,
          description: values[1] || '',
          category: values[2] || 'General',
          uom: values[3] || 'Each',
          brand: values[4] || undefined,
          model: values[5] || undefined,
          specifications: values[6] ? JSON.parse(values[6]) : {},
          is_active: true,
          approval_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'system',
          created_by_name: 'System Import'
        };
        
        // Validate required fields
        if (!item.description) {
          errors.push(`Row ${i + 1}: Description is required`);
          continue;
        }
        
        // Check for duplicate item codes
        const existingItem = items.find(existing => existing.item_code === item.item_code) ||
                           importedItems.find(existing => existing.item_code === item.item_code);
        
        if (existingItem) {
          errors.push(`Row ${i + 1}: Item code ${item.item_code} already exists`);
          continue;
        }
        
        importedItems.push(item);
      } catch {
        errors.push(`Row ${i + 1}: Invalid data format`);
      }
    }
    
    // Add imported items to database
    items.push(...importedItems);
    
    return NextResponse.json({
      message: 'Import completed',
      imported: importedItems.length,
      errors: errors.length,
      details: {
        successful: importedItems.map(item => ({
          item_code: item.item_code,
          description: item.description
        })),
        errors: errors
      }
    });
  } catch (error) {
    console.error('Error importing items:', error);
    return NextResponse.json(
      { error: 'Failed to import items' },
      { status: 500 }
    );
  }
}
