import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8888";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token') || '';
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/stock-performance-scores${queryString ? `?${queryString}` : ''}`, {
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
    console.error("Error fetching stock performance scores:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stock performance scores" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('token') || '';
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/stock-performance-scores`, {
      method: "POST",
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
    console.error("Error creating stock performance score:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create stock performance score" },
      { status: 500 }
    );
  }
}
