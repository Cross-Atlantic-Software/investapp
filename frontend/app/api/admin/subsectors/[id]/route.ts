import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('token');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/subsectors/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "token": token,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating subsector:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update subsector" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('token');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    const { id } = await params;
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/subsectors/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "token": token,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting subsector:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete subsector" },
      { status: 500 }
    );
  }
}

