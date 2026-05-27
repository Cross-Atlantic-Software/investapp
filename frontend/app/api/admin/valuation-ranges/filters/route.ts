import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/valuation-ranges/filters`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        message: data.message || 'Failed to fetch valuation ranges' 
      }, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in valuation ranges filters API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
