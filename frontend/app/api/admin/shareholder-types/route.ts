import { NextRequest, NextResponse } from 'next/server';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Admin token required' },
        { status: 401 }
      );
    }
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/shareholder-types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching shareholder types:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch shareholder types' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('token');
    const body = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Admin token required' },
        { status: 401 }
      );
    }
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/shareholder-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating shareholder type:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create shareholder type' },
      { status: 500 }
    );
  }
}
