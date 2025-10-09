import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the admin token from headers
    const token = request.headers.get('token') || '';
    
    console.log(`Forwarding CSV export request for stock ID: ${id}`);
    console.log(`Backend URL: ${API_BASE_URL}/backend/api/admin/stocks/${id}/price-data/export`);
    console.log(`Token present: ${!!token}`);
    
    // Forward the request to the backend
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/stocks/${id}/price-data/export`, {
      method: 'GET',
      headers: {
        'token': token,
      },
    });
    
    console.log(`Backend response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return NextResponse.json(
        { success: false, message: 'Failed to export CSV' },
        { status: response.status }
      );
    }

    // Get the CSV content from the backend
    const csvContent = await response.text();
    
    // Return the CSV content with appropriate headers
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="stock_${id}_price_data.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export CSV' },
      { status: 500 }
    );
  }
}
