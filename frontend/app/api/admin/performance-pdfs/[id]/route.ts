import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

// Get a specific performance PDF by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('token') || '';
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/performance-pdfs/${id}`, {
      headers: {
        'token': token,
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Competitive Benchmarking PDF:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch Competitive Benchmarking PDF' },
      { status: 500 }
    );
  }
}

// Update a specific performance PDF
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const token = request.headers.get('token') || '';
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/performance-pdfs/${id}`, {
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
    console.error('Error updating Competitive Benchmarking PDF:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update Competitive Benchmarking PDF' },
      { status: 500 }
    );
  }
}

// Delete a specific performance PDF
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('token') || '';
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/performance-pdfs/${id}`, {
      method: 'DELETE',
      headers: {
        'token': token,
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error deleting Competitive Benchmarking PDF:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete Competitive Benchmarking PDF' },
      { status: 500 }
    );
  }
}
