import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

// Get all investment rationales for a specific stock
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
    
    const url = `${API_BASE_URL}/backend/api/admin/stocks/${id}/investment-rationales?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'token': token,
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching investment rationales:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch investment rationales' },
      { status: 500 }
    );
  }
}

// Create a new investment rationale for a specific stock
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const token = request.headers.get('token') || '';
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/stocks/${id}/investment-rationales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error creating investment rationale:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create investment rationale' },
      { status: 500 }
    );
  }
}
