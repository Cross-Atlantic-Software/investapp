import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

// Get a specific scorecard by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('token') || '';
    
    const response = await fetch(`${API_BASE_URL}/api/admin/scorecards/${id}`, {
      headers: {
        'token': token,
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching scorecard:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch scorecard' },
      { status: 500 }
    );
  }
}

// Update a specific scorecard
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const token = request.headers.get('token') || '';
    
    const response = await fetch(`${API_BASE_URL}/api/admin/scorecards/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error updating scorecard:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update scorecard' },
      { status: 500 }
    );
  }
}

// Delete a specific scorecard
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('token') || '';
    
    const response = await fetch(`${API_BASE_URL}/api/admin/scorecards/${id}`, {
      method: 'DELETE',
      headers: {
        'token': token,
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error deleting scorecard:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete scorecard' },
      { status: 500 }
    );
  }
}
