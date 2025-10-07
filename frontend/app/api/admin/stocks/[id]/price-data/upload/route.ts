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
    
    console.log(`Forwarding CSV upload request for stock ID: ${id}`);
    console.log(`Backend URL: ${API_BASE_URL}/backend/api/admin/stocks/${id}/price-data/upload`);
    console.log(`Token present: ${!!token}`);
    
    // Forward the request to the backend
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/stocks/${id}/price-data/upload`, {
      method: 'POST',
      headers: {
        'token': token,
      },
      body: formData,
    });
    
    console.log(`Backend response status: ${response.status}`);
    console.log(`Backend response headers:`, Object.fromEntries(response.headers.entries()));

    // Check if response is JSON or HTML
    const contentType = response.headers.get('content-type');
    let result;
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      // If it's HTML (error page), extract text and return error
      const htmlText = await response.text();
      console.error('Backend returned HTML instead of JSON:', htmlText);
      return NextResponse.json(
        { success: false, message: 'Backend server error - please check server logs' },
        { status: 500 }
      );
    }

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
