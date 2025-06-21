# Supabase Setup for MediScan AI

## Quick Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and set project name: "mediscan-ai"
4. Set database password (save this!)
5. Select region closest to your users
6. Click "Create new project"

### 2. Configure Authentication Settings
1. Go to Authentication → Settings in your Supabase dashboard
2. Under "User Signups" section:
   - **Enable email confirmations**: Toggle OFF (for development)
   - **Enable phone confirmations**: Toggle OFF
   - **Enable manual linking**: Toggle ON (optional)
3. Under "Auth Providers":
   - **Email**: Enabled ✅
   - **Phone**: Disabled (unless needed)
4. Click "Save" to apply changes

### 3. Run Database Schema
1. Go to your Supabase dashboard
2. Click "SQL Editor" in the sidebar
3. Copy and paste the SQL from `scripts/supabase-schema-fixed.sql`
4. Click "Run" to execute

### 4. Configure Environment Variables
Create `.env.local` file in your project root:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### 5. Get Your Keys
In Supabase dashboard:
1. Go to Settings → API
2. Copy "Project URL" → use as `NEXT_PUBLIC_SUPABASE_URL`
3. Copy "anon public" key → use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy "service_role" key → use as `SUPABASE_SERVICE_ROLE_KEY`

### 6. Enable Storage (Optional)
1. Go to Storage in Supabase dashboard
2. Create a new bucket called "medical-images"
3. Set it to public if you want direct image access

### 7. Test Your Setup
1. Run `npm install` to install dependencies
2. Run `npm run dev` to start development server
3. Visit `http://localhost:3000`
4. Try creating an account and uploading an image

## Email Confirmation Settings

### For Development (Recommended)
- **Disable email confirmations** in Authentication → Settings
- Users can sign up and sign in immediately
- No email verification required

### For Production
- **Enable email confirmations** for security
- Configure email templates in Authentication → Templates
- Set up custom SMTP (optional) in Authentication → Settings → SMTP

## Features Enabled
- ✅ User authentication with Supabase Auth
- ✅ PostgreSQL database with Row Level Security
- ✅ Real-time subscriptions (can be added)
- ✅ File storage for medical images
- ✅ Automatic user profile creation
- ✅ Audit logging for all scan changes
- ✅ HIPAA-compliant security features
- ✅ Email confirmation handling

## Troubleshooting

### Email Not Confirmed Error
1. **Quick Fix**: Disable email confirmations in Supabase dashboard
2. **Alternative**: Check spam folder for confirmation emails
3. **Manual Fix**: Run the SQL script `scripts/disable-email-confirmation.sql`

### Common Issues
- Make sure all environment variables are set correctly
- Check that RLS policies are enabled
- Verify your database schema was created successfully
- Check browser console for any errors
- Ensure email confirmation is disabled for development

### Email Configuration
- For development: Disable email confirmations
- For production: Configure proper SMTP settings
- Test email delivery in Authentication → Settings → SMTP
