import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || 
                  request.headers.get('token');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    // Get form data (including files)
    const formData = await request.formData();

    const response = await fetch(`${API_BASE_URL}/backend/api/auth/kyc`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'token': token,
        // Don't set Content-Type for FormData, let fetch handle it
      },
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error creating KYC application:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
