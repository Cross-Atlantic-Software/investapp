import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('token');
    const { searchParams } = new URL(request.url);
    const queryParams = new URLSearchParams(searchParams).toString();

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token required' }, { status: 401 });
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';
    const backendUrl = `${API_BASE_URL}/backend/api/admin/stocks/${id}/sector-insights-pdfs${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Error fetching sector & company insights PDFs:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch sector & company insights PDFs', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('token');

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token required' }, { status: 401 });
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';
    const backendUrl = `${API_BASE_URL}/backend/api/admin/stocks/${id}/sector-insights-pdfs`;
    
    const formData = await request.formData();
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'token': token,
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Error creating Sector & Comapany insights PDF:', error);
    return NextResponse.json({ success: false, message: 'Failed to create Sector & Comapany insights PDF', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
