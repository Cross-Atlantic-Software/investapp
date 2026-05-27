import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8888";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = request.headers.get('token') || '';
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/stock-performance-scores/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "token": token
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching stock performance score:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stock performance score" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = request.headers.get('token') || '';
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/stock-performance-scores/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "token": token
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating stock performance score:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update stock performance score" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = request.headers.get('token') || '';
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/stock-performance-scores/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "token": token
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting stock performance score:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete stock performance score" },
      { status: 500 }
    );
  }
}
