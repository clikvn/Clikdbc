# Deployment Checklist

## Pre-Deployment

### Database Setup
- [ ] Run `COPY_SETUP_ALL_TABLES.txt` in Supabase SQL Editor
- [ ] Verify all 3 tables exist: `user_infos`, `user_contacts`, `user_profiles`
- [ ] Verify RLS policies are active on all tables
- [ ] Test creating a user and saving data

### Storage Setup
- [ ] Create `profile-images` bucket in Supabase Storage (public, 2MB limit)
- [ ] Create `avatar-images` bucket in Supabase Storage (public, 2MB limit)
- [ ] Run `COPY_SETUP_STORAGE_RLS_POLICIES.txt` for Storage RLS policies
- [ ] Test uploading an image

### Authentication Setup
- [ ] Configure email authentication in Supabase
- [ ] Set email confirmation settings (disable for testing, enable for production)
- [ ] Test user registration
- [ ] Test user login

## Vercel Configuration

### Environment Variables
- [ ] `VITE_SUPABASE_URL` - Set to your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Set to your Supabase anon public key
- [ ] `VITE_OPENAI_API_KEY` - Optional, for AI features
- [ ] `VITE_OPENAI_WORKFLOW_ID` - Optional, for AI workflows

### Build Settings
- [ ] Framework: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `build`
- [ ] Install Command: `npm install`

### Deployment
- [ ] Repository connected to Vercel
- [ ] Environment variables added
- [ ] Build completes successfully
- [ ] Deployment is live

## Post-Deployment Testing

### Authentication
- [ ] User can register new account
- [ ] User can login with existing account
- [ ] User is redirected correctly after login/register
- [ ] Unauthenticated users are redirected to login

### Data Operations
- [ ] User can save personal information (name, title, business, bio)
- [ ] User can save contact information (phone, email, address, messaging, social)
- [ ] User can save profile information (about, service areas, specialties, etc.)
- [ ] Data loads correctly when viewing profile
- [ ] Visibility groups work correctly

### Image Operations
- [ ] User can upload background image (under 2MB)
- [ ] User can upload avatar image (under 2MB)
- [ ] Images are displayed correctly
- [ ] Image positioning works
- [ ] Old images are deleted when replaced

### Routing
- [ ] Root URL (`/`) redirects to `/login`
- [ ] Login page is accessible
- [ ] Register page is accessible
- [ ] User profile page is accessible after login
- [ ] CMS studio is accessible after login
- [ ] All routes work correctly (SPA routing)

## Security Checklist

- [ ] Using **anon public** key (not service_role key)
- [ ] RLS policies are active on all tables
- [ ] Storage buckets have proper RLS policies
- [ ] Environment variables are set in Vercel (not in code)
- [ ] No sensitive keys in repository

## Performance Checklist

- [ ] Build completes in reasonable time (< 5 minutes)
- [ ] Page loads quickly (< 3 seconds)
- [ ] Images are optimized
- [ ] Static assets are cached properly

## Documentation

- [ ] `VERCEL_DEPLOYMENT.md` reviewed
- [ ] `DEPLOYMENT_CHECKLIST.md` reviewed
- [ ] All SQL scripts are available
- [ ] Environment variable guide is clear
