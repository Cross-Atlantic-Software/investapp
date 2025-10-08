import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; category: string }> }
) {
  try {
    const { id, category } = await params;
    
    console.log(`Fetching financial data for stock ${id}, category: ${category}`);
    console.log(`Backend URL: ${API_BASE_URL}/backend/api/public/stocks/${id}/financial-data/${category}`);

    const response = await fetch(
      `${API_BASE_URL}/backend/api/public/stocks/${id}/financial-data/${category}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const contentType = response.headers.get('content-type');
    let result;
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const htmlText = await response.text();
      console.error('Backend returned HTML instead of JSON:', htmlText);
      return NextResponse.json(
        { success: false, message: 'Backend server error - please check server logs' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching financial data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch financial data' },
      { status: 500 }
    );
  }
}
