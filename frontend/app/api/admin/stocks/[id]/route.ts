import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8888';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('token');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    const { id } = await params;
    const response = await fetch(`${BACKEND_URL}/api/admin/stocks/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in /api/admin/stocks/[id]:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('token');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    const { id } = await params;
    const formData = await request.formData();

    const response = await fetch(`${BACKEND_URL}/api/admin/stocks/${id}`, {
      method: 'PUT',
      headers: {
        'token': token,
      },
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in /api/admin/stocks/[id] PUT:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('token');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    const { id } = await params;
    const response = await fetch(`${BACKEND_URL}/api/admin/stocks/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in /api/admin/stocks/[id] DELETE:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
