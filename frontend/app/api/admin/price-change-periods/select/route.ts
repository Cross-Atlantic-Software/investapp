import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function GET() {
  try {
    const url = `${API_BASE_URL}/backend/api/admin/price-change-periods/select`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching price change periods for select:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch price change periods' },
      { status: 500 }
    );
  }
}
