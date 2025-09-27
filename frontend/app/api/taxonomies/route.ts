import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:8888';

export async function GET(request: NextRequest) {
  try {
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Fetching from:', `${API_BASE_URL}/api/admin/taxonomies/status/active`);
    
    const response = await fetch(`${API_BASE_URL}/api/admin/taxonomies/status/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText);
      return NextResponse.json({ 
        success: false, 
        message: `Backend API error: ${response.status} ${response.statusText}` 
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in /api/taxonomies:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
