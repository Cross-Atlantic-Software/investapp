import {  NextResponse } from 'next/server';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL  || 'http://localhost:8888';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/backend/api/shareholder-types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching shareholder types:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch shareholder types' },
      { status: 500 }
    );
  }
}
