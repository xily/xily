import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/options';
import connectDB from '@/app/lib/mongodb';
import Internship from '@/models/Internship';
import Recruiter from '@/models/Recruiter';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    // Check if user is a recruiter
    const recruiter = await Recruiter.findOne({ userId: session.user.id });
    if (!recruiter) {
      return NextResponse.json({ error: 'Recruiter profile required' }, { status: 403 });
    }
    
    // Fetch internships for this recruiter
    const internships = await (Internship as any).find({ recruiterId: recruiter._id })
      .sort({ featured: -1, createdAt: -1 })
      .lean();
    
    return NextResponse.json(internships);
  } catch (error) {
    console.error('Error fetching recruiter internships:', error);
    return NextResponse.json({ error: 'Failed to fetch internships' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    // Check if user is a recruiter
    const recruiter = await Recruiter.findOne({ userId: session.user.id });
    if (!recruiter) {
      return NextResponse.json({ error: 'Recruiter profile required' }, { status: 403 });
    }
    
    const { title, company, location, industry, graduationYear, season, deadline, applyLink, featured } = await request.json();
    
    if (!title || !company || !industry) {
      return NextResponse.json({ error: 'Title, company, and industry are required' }, { status: 400 });
    }
    
    const internship = new Internship({
      title: title.trim(),
      company: company.trim(),
      location: location?.trim(),
      industry,
      graduationYear,
      season,
      deadline: deadline ? new Date(deadline) : undefined,
      applyLink: applyLink?.trim(),
      recruiterId: recruiter._id,
      featured: featured || false,
      verified: true
    });
    
    await internship.save();
    
    return NextResponse.json(internship, { status: 201 });
  } catch (error) {
    console.error('Error creating internship:', error);
    return NextResponse.json({ error: 'Failed to create internship' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    // Check if user is a recruiter
    const recruiter = await Recruiter.findOne({ userId: session.user.id });
    if (!recruiter) {
      return NextResponse.json({ error: 'Recruiter profile required' }, { status: 403 });
    }
    
    const { internshipId, title, company, location, industry, graduationYear, season, deadline, applyLink, featured } = await request.json();
    
    if (!internshipId) {
      return NextResponse.json({ error: 'Internship ID is required' }, { status: 400 });
    }
    
    // Check if internship belongs to this recruiter
    const internship = await Internship.findOne({ _id: internshipId, recruiterId: recruiter._id });
    if (!internship) {
      return NextResponse.json({ error: 'Internship not found or unauthorized' }, { status: 404 });
    }
    
    // Update fields
    if (title !== undefined) internship.title = title.trim();
    if (company !== undefined) internship.company = company.trim();
    if (location !== undefined) internship.location = location?.trim();
    if (industry !== undefined) internship.industry = industry;
    if (graduationYear !== undefined) internship.graduationYear = graduationYear;
    if (season !== undefined) internship.season = season;
    if (deadline !== undefined) internship.deadline = deadline ? new Date(deadline) : undefined;
    if (applyLink !== undefined) internship.applyLink = applyLink?.trim();
    if (featured !== undefined) internship.featured = featured;
    
    await internship.save();
    
    return NextResponse.json(internship);
  } catch (error) {
    console.error('Error updating internship:', error);
    return NextResponse.json({ error: 'Failed to update internship' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    // Check if user is a recruiter
    const recruiter = await Recruiter.findOne({ userId: session.user.id });
    if (!recruiter) {
      return NextResponse.json({ error: 'Recruiter profile required' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const internshipId = searchParams.get('id');
    
    if (!internshipId) {
      return NextResponse.json({ error: 'Internship ID is required' }, { status: 400 });
    }
    
    // Check if internship belongs to this recruiter
    const internship = await Internship.findOne({ _id: internshipId, recruiterId: recruiter._id });
    if (!internship) {
      return NextResponse.json({ error: 'Internship not found or unauthorized' }, { status: 404 });
    }
    
    await Internship.findByIdAndDelete(internshipId);
    
    return NextResponse.json({ message: 'Internship deleted successfully' });
  } catch (error) {
    console.error('Error deleting internship:', error);
    return NextResponse.json({ error: 'Failed to delete internship' }, { status: 500 });
  }
}
