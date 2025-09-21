import { NextRequest, NextResponse } from 'next/server';
import { IntegrationConfig } from '@/types/admin';

// Mock data for integrations
const mockIntegrations: IntegrationConfig[] = [
  {
    id: '1',
    integration_type: 'sso',
    is_enabled: true,
    configuration: {
      provider: 'azure_ad',
      client_id: 'your-client-id',
      tenant_id: 'your-tenant-id',
      redirect_uri: 'https://your-app.com/auth/callback'
    },
    last_tested: '2024-01-15T10:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    integration_type: 'esignature',
    is_enabled: false,
    configuration: {
      provider: 'docusign',
      api_key: 'your-api-key',
      environment: 'sandbox',
      webhook_url: 'https://your-app.com/webhooks/docusign'
    },
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z'
  }
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockIntegrations
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, is_enabled, configuration } = body;

    const integrationIndex = mockIntegrations.findIndex(i => i.id === id);
    if (integrationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Update integration
    mockIntegrations[integrationIndex] = {
      ...mockIntegrations[integrationIndex],
      is_enabled: is_enabled !== undefined ? is_enabled : mockIntegrations[integrationIndex].is_enabled,
      configuration: configuration || mockIntegrations[integrationIndex].configuration,
      last_tested: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockIntegrations[integrationIndex]
    });
  } catch (error) {
    console.error('Error updating integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update integration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { integration_type, configuration } = body;

    // Validate required fields
    if (!integration_type || !configuration) {
      return NextResponse.json(
        { success: false, error: 'Integration type and configuration are required' },
        { status: 400 }
      );
    }

    // Create new integration
    const newIntegration: IntegrationConfig = {
      id: (mockIntegrations.length + 1).toString(),
      integration_type,
      is_enabled: false,
      configuration,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockIntegrations.push(newIntegration);

    return NextResponse.json({
      success: true,
      data: newIntegration
    });
  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create integration' },
      { status: 500 }
    );
  }
}

