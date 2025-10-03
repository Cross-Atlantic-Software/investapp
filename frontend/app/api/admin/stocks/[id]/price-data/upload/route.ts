import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the form data from the request
    const formData = await request.formData();
    
    // Get the admin token from headers
    const token = request.headers.get('token') || '';
    
    // Forward the request to the backend
    const response = await fetch(`${API_BASE_URL}/api/admin/stocks/${id}/price-data/upload`, {
      method: 'POST',
      headers: {
        'token': token,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: result.message || 'Failed to upload CSV' },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error uploading CSV:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
