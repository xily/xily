# Ms Intern - Your Internship Discovery Partner

A comprehensive platform for students to discover internships, track applications, and connect with recruiters. Built with Next.js 15, TypeScript, Tailwind CSS, and MongoDB.

## 🚀 Features

### Core Student Features
- **Internship Discovery**: Browse internships with advanced filters (graduation year, season, location, industry)
- **Application Tracker**: Track application status with notes and timeline
- **Deadline Tracker**: Real-time countdown to application deadlines
- **Saved Internships**: Save interesting opportunities for later

### Growth Features
- **Saved Filters**: Save and reuse search criteria
- **Email Alerts**: Get notified about new matching internships
- **Push Notifications**: Browser notifications for updates
- **Analytics Dashboard**: Track application progress and insights

### Community Features
- **Company Reviews**: Rate and review internship experiences
- **Resume Review**: Upload and get peer feedback on resumes
- **Advice Board**: Share career tips and experiences
- **Recruiter Dashboard**: Companies can post and manage internships

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: NextAuth.js
- **Email**: Nodemailer
- **Push Notifications**: Web Push API
- **Charts**: Recharts

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB database
- Email service (Gmail, SendGrid, etc.)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd internly
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ms-intern
# or MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ms-intern

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Email Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Push Notifications (Optional)
VAPID_SUBJECT=mailto:your-email@example.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

### 4. Database Setup

Ensure MongoDB is running and accessible. The application will automatically create the necessary collections.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📱 User Flows

### Student Journey
1. **Register/Login** → Create account or sign in
2. **Browse Internships** → Use filters to find relevant opportunities
3. **Save Filters** → Save search criteria for future use
4. **Apply to Internships** → Track applications with status updates
5. **Community Engagement** → Post reviews, upload resume, share advice

### Recruiter Journey
1. **Register as Recruiter** → Create recruiter profile
2. **Post Internships** → Add internship listings with details
3. **Manage Listings** → Edit, feature, or delete internships
4. **Monitor Applications** → Track student applications

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/internships` - List internships with filters
- `GET /api/advice-posts` - Get advice board posts
- `GET /api/reviews` - Get company reviews

### Authenticated Endpoints
- `POST /api/applications` - Create/update application
- `POST /api/saved` - Save/unsave internship
- `POST /api/filters` - Save search filters
- `POST /api/recruiter-internships` - Manage internship listings

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 Monitoring

- **Email Alerts**: Run `npm run check-alerts` to send email notifications
- **Push Notifications**: Configure VAPID keys for browser notifications
- **Analytics**: Built-in application tracking dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email xilyofficial@gmail.com or create an issue in the repository.
