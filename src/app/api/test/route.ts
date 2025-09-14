import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ 
      message: 'MongoDB connection successful!',
      status: 'connected' 
    });
  } catch (error) {
    return NextResponse.json(
      { 
        message: 'MongoDB connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

