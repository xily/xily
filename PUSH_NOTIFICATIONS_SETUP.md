# Push Notifications Setup Guide

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Database
MONGODB_URI=your_mongodb_connection_string_here

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Email (SMTP)
SMTP_USER=your_gmail_address_here
SMTP_PASS=your_gmail_app_password_here

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Push Notifications (VAPID Keys)
# Generate with: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here
VAPID_SUBJECT=mailto:admin@internly.com
```

## Generate VAPID Keys

Run this command to generate your own VAPID keys:

```bash
npx web-push generate-vapid-keys
```

Copy the generated keys to your `.env.local` file.

## Security Notes

- Never commit `.env.local` to version control
- Keep VAPID private key secure
- Use different keys for development and production
- The public key can be exposed in client-side code (it's safe)
- The private key must remain server-side only

## Testing

1. Start your development server: `npm run dev`
2. Go to the dashboard
3. Click "Enable Notifications"
4. Grant permission when prompted
5. Click "Test Notification" to verify it works
