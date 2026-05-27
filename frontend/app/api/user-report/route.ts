import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token');
    
    console.log('🔐 Frontend API: Token received:', token ? 'Yes' : 'No');
    console.log('🔐 Frontend API: Token length:', token?.length || 0);
    
    if (!token) {
      console.log('❌ Frontend API: No token provided');
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    console.log('📡 Frontend API: Forwarding request to backend...');
    const response = await fetch(`${API_BASE_URL}/backend/api/user-report`, {
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
    });

    console.log('📡 Frontend API: Backend response status:', response.status);
    const data = await response.json();
    console.log('📡 Frontend API: Backend response data:', data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Frontend API: Error fetching user report:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

