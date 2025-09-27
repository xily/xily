import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER, // Your Gmail address
      pass: process.env.SMTP_PASS, // Your Gmail app password
    },
  });
};

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP credentials not configured');
      return false;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Mr.Intern" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendInternshipAlert = async (
  userEmail: string,
  userName: string,
  filterName: string,
  internships: Array<{
    title: string;
    company: string;
    location?: string;
    industry?: string;
    applyLink?: string;
  }>
): Promise<boolean> => {
  const subject = `🔔 New Internships Matching Your Filter: ${filterName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Internships Found!</h2>
      <p>Hi ${userName},</p>
      <p>We found ${internships.length} new internship${internships.length === 1 ? '' : 's'} matching your saved filter: <strong>${filterName}</strong></p>
      
      <div style="margin: 20px 0;">
        ${internships.map(internship => `
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 12px 0; background: #f9fafb;">
            <h3 style="margin: 0 0 8px 0; color: #111827;">${internship.title}</h3>
            <p style="margin: 4px 0; color: #6b7280; font-weight: 600;">${internship.company}</p>
            ${internship.location ? `<p style="margin: 4px 0; color: #6b7280;">📍 ${internship.location}</p>` : ''}
            ${internship.industry ? `<p style="margin: 4px 0; color: #6b7280;">🏢 ${internship.industry}</p>` : ''}
            ${internship.applyLink ? `
              <a href="${internship.applyLink}" style="display: inline-block; background: #2563eb; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin-top: 8px;">
                Apply Now
              </a>
            ` : ''}
          </div>
        `).join('')}
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/internships" style="color: #2563eb;">
          View all internships on Mr.Intern
        </a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
      <p style="color: #9ca3af; font-size: 12px;">
        You're receiving this because you enabled email alerts for this filter. 
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/internships" style="color: #6b7280;">Manage your alerts</a>
      </p>
    </div>
  `;

  const text = `
New Internships Found!

Hi ${userName},

We found ${internships.length} new internship${internships.length === 1 ? '' : 's'} matching your saved filter: ${filterName}

${internships.map(internship => `
${internship.title}
${internship.company}
${internship.location ? `📍 ${internship.location}` : ''}
${internship.industry ? `🏢 ${internship.industry}` : ''}
${internship.applyLink ? `Apply: ${internship.applyLink}` : ''}
`).join('\n')}

View all internships: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/internships

You're receiving this because you enabled email alerts for this filter.
  `;

  return await sendEmail({
    to: userEmail,
    subject,
    text,
    html,
  });
};
