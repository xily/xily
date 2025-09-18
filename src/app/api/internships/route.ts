import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Internship from '@/models/Internship';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const filter: any = {};
    
    // Filter by graduationYear
    if (searchParams.get('graduationYear')) {
      filter.graduationYear = parseInt(searchParams.get('graduationYear')!);
    }
    
    // Filter by season (case-insensitive)
    if (searchParams.get('season')) {
      filter.season = { $regex: searchParams.get('season'), $options: 'i' };
    }
    
    // Filter by location (case-insensitive)
    if (searchParams.get('location')) {
      filter.location = { $regex: searchParams.get('location'), $options: 'i' };
    }
    
    // Filter by industry (case-insensitive)
    if (searchParams.get('industry')) {
      filter.industry = { $regex: searchParams.get('industry'), $options: 'i' };
    }
    
    const internships = await Internship.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: internships });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const created = await Internship.create(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}


