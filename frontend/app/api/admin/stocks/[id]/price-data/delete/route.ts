import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the admin token from headers
    const token = request.headers.get('token') || '';
    
    console.log(`Forwarding price data delete request for stock ID: ${id}`);
    console.log(`Backend URL: ${API_BASE_URL}/backend/api/admin/stocks/${id}/price-data/admin`);
    console.log(`Token present: ${!!token}`);
    
    // Forward the request to the backend
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/stocks/${id}/price-data/admin`, {
      method: 'DELETE',
      headers: {
        'token': token,
      },
    });
    
    console.log(`Backend response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return NextResponse.json(
        { success: false, message: 'Failed to delete price data' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting price data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete price data' },
      { status: 500 }
    );
  }
}
