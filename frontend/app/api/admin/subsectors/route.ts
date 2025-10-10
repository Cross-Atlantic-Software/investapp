import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

// Get all subsectors
export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/subsectors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching subsectors:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch subsectors' },
      { status: 500 }
    );
  }
}

// Create new subsector
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/subsectors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating subsector:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create subsector' },
      { status: 500 }
    );
  }
}