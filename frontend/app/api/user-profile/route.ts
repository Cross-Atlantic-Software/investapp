import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token');
    
    console.log('🔐 UserProfile API: Token received:', token ? 'Yes' : 'No');
    console.log('🔐 UserProfile API: Token length:', token?.length || 0);
    
    if (!token) {
      console.log('❌ UserProfile API: No token provided');
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    console.log('📡 UserProfile API: Forwarding request to backend...');
    const response = await fetch(`${API_BASE_URL}/backend/api/user-profile`, {
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
    });

    console.log('📡 UserProfile API: Backend response status:', response.status);
    const data = await response.json();
    console.log('📡 UserProfile API: Backend response data:', data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ UserProfile API: Error fetching user profile:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('token');
    
    console.log('🔐 UserProfile API PUT: Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('❌ UserProfile API PUT: No token provided');
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📝 UserProfile API PUT: Request body:', body);

    console.log('📡 UserProfile API PUT: Forwarding request to backend...');
    const response = await fetch(`${API_BASE_URL}/backend/api/user-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify(body),
    });

    console.log('📡 UserProfile API PUT: Backend response status:', response.status);
    const data = await response.json();
    console.log('📡 UserProfile API PUT: Backend response data:', data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ UserProfile API PUT: Error updating user profile:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
