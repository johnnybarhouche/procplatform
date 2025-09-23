import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, projectId } = await request.json();

    // Basic validation
    if (!userId || !projectId) {
      return NextResponse.json(
        { error: 'User ID and Project ID are required' },
        { status: 400 }
      );
    }

    // Simulate project assignment (replace with real project assignment logic)
    console.log('Project assignment:', { userId, projectId });

    return NextResponse.json({
      success: true,
      message: 'Project assigned successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
