import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { sendInternshipAlert } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }

    // Test email with sample data
    const testInternships = [
      {
        title: 'Software Engineering Intern',
        company: 'Test Company',
        location: 'San Francisco, CA',
        industry: 'Tech',
        applyLink: 'https://example.com/apply'
      }
    ];

    const success = await sendInternshipAlert(
      email,
      name,
      'Test Filter: Tech, San Francisco',
      testInternships
    );

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send test email' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
