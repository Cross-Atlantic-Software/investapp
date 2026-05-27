import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const url = `${API_BASE_URL}/backend/api/admin/contact-faqs/bulk-delete`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error bulk deleting contact FAQs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to bulk delete contact FAQs' },
      { status: 500 }
    );
  }
}
