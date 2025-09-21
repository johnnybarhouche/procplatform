import { NextRequest, NextResponse } from 'next/server';
import { SystemSetting } from '@/types/admin';

// Mock data for system settings
const mockSettings: SystemSetting[] = [
  {
    id: '1',
    setting_key: 'system_name',
    setting_value: 'Procurement Management System',
    setting_type: 'string',
    description: 'The name of the system displayed to users',
    updated_at: '2024-01-15T10:00:00Z',
    updated_by: 'admin'
  },
  {
    id: '2',
    setting_key: 'max_file_size_mb',
    setting_value: '10',
    setting_type: 'number',
    description: 'Maximum file upload size in MB',
    updated_at: '2024-01-15T10:00:00Z',
    updated_by: 'admin'
  },
  {
    id: '3',
    setting_key: 'session_timeout_minutes',
    setting_value: '30',
    setting_type: 'number',
    description: 'User session timeout in minutes',
    updated_at: '2024-01-15T10:00:00Z',
    updated_by: 'admin'
  },
  {
    id: '4',
    setting_key: 'enable_notifications',
    setting_value: 'true',
    setting_type: 'boolean',
    description: 'Enable system notifications',
    updated_at: '2024-01-15T10:00:00Z',
    updated_by: 'admin'
  },
  {
    id: '5',
    setting_key: 'default_currency',
    setting_value: 'AED',
    setting_type: 'string',
    description: 'Default currency for the system',
    updated_at: '2024-01-15T10:00:00Z',
    updated_by: 'admin'
  }
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockSettings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, setting_value } = body;

    const settingIndex = mockSettings.findIndex(s => s.id === id);
    if (settingIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Setting not found' },
        { status: 404 }
      );
    }

    // Update setting
    mockSettings[settingIndex] = {
      ...mockSettings[settingIndex],
      setting_value,
      updated_at: new Date().toISOString(),
      updated_by: 'admin'
    };

    return NextResponse.json({
      success: true,
      data: mockSettings[settingIndex]
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { setting_key, setting_value, setting_type, description } = body;

    // Validate required fields
    if (!setting_key || !setting_value || !setting_type) {
      return NextResponse.json(
        { success: false, error: 'Setting key, value, and type are required' },
        { status: 400 }
      );
    }

    // Check if setting already exists
    const existingSetting = mockSettings.find(s => s.setting_key === setting_key);
    if (existingSetting) {
      return NextResponse.json(
        { success: false, error: 'Setting with this key already exists' },
        { status: 400 }
      );
    }

    // Create new setting
    const newSetting: SystemSetting = {
      id: (mockSettings.length + 1).toString(),
      setting_key,
      setting_value,
      setting_type,
      description,
      updated_at: new Date().toISOString(),
      updated_by: 'admin'
    };

    mockSettings.push(newSetting);

    return NextResponse.json({
      success: true,
      data: newSetting
    });
  } catch (error) {
    console.error('Error creating setting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create setting' },
      { status: 500 }
    );
  }
}

