import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

// Get all sectors for select dropdown
export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/sectors/select`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sectors for select:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sectors for select' },
      { status: 500 }
    );
  }
}
