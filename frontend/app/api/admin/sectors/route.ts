import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

// Get all sectors
export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/sectors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sectors:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sectors' },
      { status: 500 }
    );
  }
}

// Create new sector
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/sectors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating sector:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create sector' },
      { status: 500 }
    );
  }
}

