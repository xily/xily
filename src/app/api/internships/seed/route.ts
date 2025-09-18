import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Internship from '@/models/Internship';

export async function GET() {
  try {
    await connectDB();
    const sample = {
      title: 'Software Engineering Intern',
      company: 'Google',
      location: 'New York, NY',
      industry: 'Tech',
      graduationYear: 2026,
      season: 'Summer 2026',
      deadline: new Date('2025-11-15T00:00:00.000Z'),
      applyLink: 'https://careers.google.com',
      verified: true,
    };

    const existing = await Internship.findOne({ title: sample.title, company: sample.company });
    const doc = existing || (await Internship.create(sample));

    return NextResponse.json({ success: true, data: doc });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}


