import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/options';
import connectDB from '@/app/lib/mongodb';
import Recruiter from '@/models/Recruiter';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const recruiter = await Recruiter.findOne({ userId: session.user.id });
    
    if (!recruiter) {
      return NextResponse.json({ error: 'Recruiter profile not found' }, { status: 404 });
    }
    
    return NextResponse.json(recruiter);
  } catch (error) {
    console.error('Error fetching recruiter profile:', error);
    return NextResponse.json({ error: 'Failed to fetch recruiter profile' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const { companyName, website } = await request.json();
    
    if (!companyName || !website) {
      return NextResponse.json({ error: 'Company name and website are required' }, { status: 400 });
    }
    
    // Check if recruiter profile already exists
    const existingRecruiter = await Recruiter.findOne({ userId: session.user.id });
    if (existingRecruiter) {
      return NextResponse.json({ error: 'Recruiter profile already exists' }, { status: 400 });
    }
    
    const recruiter = new Recruiter({
      userId: session.user.id,
      companyName: companyName.trim(),
      website: website.trim()
    });
    
    await recruiter.save();
    
    return NextResponse.json(recruiter, { status: 201 });
  } catch (error) {
    console.error('Error creating recruiter profile:', error);
    return NextResponse.json({ error: 'Failed to create recruiter profile' }, { status: 500 });
  }
}
