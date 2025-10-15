import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';
    
    const response = await fetch(`${backendUrl}/backend/api/admin/valuation-mapping`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch valuation mapping' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching valuation mapping:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch valuation mapping' },
      { status: 500 }
    );
  }
}
