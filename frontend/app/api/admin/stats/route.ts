import { NextRequest, NextResponse } from 'next/server';

// const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8888'; // Commented out as it's currently unused

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    // For now, return mock data - replace with actual API calls
    const mockStats = {
      totalUsers: 1250,
      totalStocks: 45,
      totalRevenue: 125000,
      activeUsers: 890,
    };

    return NextResponse.json({
      success: true,
      data: mockStats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
