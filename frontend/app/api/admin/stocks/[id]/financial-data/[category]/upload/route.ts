import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; category: string }> }
) {
  try {
    const { id, category } = await params;
    
    // Get the form data from the request
    const formData = await request.formData();
    
    // Get the admin token from headers
    const token = request.headers.get('token') || '';
    
    console.log(`Uploading financial data CSV for stock ${id}, category: ${category}`);
    console.log(`Backend URL: ${API_BASE_URL}/backend/api/admin/stocks/${id}/financial-data/${category}/upload`);
    console.log(`Token present: ${!!token}`);
    
    // Forward the request to backend
    const response = await fetch(
      `${API_BASE_URL}/backend/api/admin/stocks/${id}/financial-data/${category}/upload`,
      {
        method: 'POST',
        headers: {
          'token': token,
        },
        body: formData,
      }
    );

    const contentType = response.headers.get('content-type');
    let result;
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const htmlText = await response.text();
      console.error('Backend returned HTML instead of JSON:', htmlText);
      return NextResponse.json(
        { success: false, message: 'Backend server error - please check server logs' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error uploading financial data CSV:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload financial data CSV' },
      { status: 500 }
    );
  }
}
