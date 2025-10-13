import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

// Get all performance PDFs for a specific stock
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    const token = request.headers.get('token') || '';
    
    const queryParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      queryParams.append(key, value);
    });
    
    const url = `${API_BASE_URL}/backend/api/admin/stocks/${id}/performance-pdfs?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'token': token,
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching performance PDFs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch performance PDFs' },
      { status: 500 }
    );
  }
}

// Upload a new performance PDF for a specific stock
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    
    const token = request.headers.get('token') || '';
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/stocks/${id}/performance-pdfs`, {
      method: 'POST',
      headers: {
        'token': token,
      },
      body: formData,
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error uploading performance PDF:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload performance PDF' },
      { status: 500 }
    );
  }
}
