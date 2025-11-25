# Vercel Deployment Guide

## Prerequisites

1. **Supabase Database Setup**
   - Run `COPY_SETUP_ALL_TABLES.txt` in Supabase SQL Editor
   - Set up Storage buckets (see `SUPABASE_STORAGE_SETUP.md`)

2. **Supabase Storage Setup**
   - Create `profile-images` bucket (public, 2MB limit)
   - Create `avatar-images` bucket (public, 2MB limit)
   - Run `COPY_SETUP_STORAGE_RLS_POLICIES.txt` for Storage RLS policies

## Environment Variables

### Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://btyjxckmqzqdqurgoojd.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
```

**How to get your keys:**
1. Go to: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/settings/api
2. Copy **Project URL** → `VITE_SUPABASE_URL`
3. Copy **anon public** key → `VITE_SUPABASE_ANON_KEY`
   - ⚠️ Use the **anon public** key (starts with `eyJ...`)
   - ❌ **DO NOT** use the service_role secret key

### Optional Environment Variables

For AI features (if enabled):

```
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_WORKFLOW_ID=your_workflow_id_here
```

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### 2. Add Environment Variables

1. In Vercel project settings, go to **Environment Variables**
2. Add all required variables (see above)
3. Set them for **Production**, **Preview**, and **Development** environments
4. Click "Save"

### 3. Deploy

1. Push your code to the connected Git branch
2. Vercel will automatically build and deploy
3. Or click "Deploy" in Vercel dashboard

### 4. Verify Deployment

1. Check build logs for any errors
2. Visit your deployed URL
3. Test:
   - User registration
   - User login
   - Data saving/loading
   - Image uploads

## Build Configuration

The project uses `vercel.json` for configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures:
- ✅ Single Page Application (SPA) routing works correctly
- ✅ All routes redirect to `index.html`
- ✅ Static assets are cached properly

## Troubleshooting

### Build Fails

**Error**: "Missing Supabase environment variables"
- **Solution**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel environment variables

**Error**: "terser not found"
- **Solution**: Already fixed - using `esbuild` minifier (see `vite.config.ts`)

### Runtime Errors

**Error**: "Cannot connect to Supabase"
- **Check**: Environment variables are set correctly
- **Check**: Supabase project is active
- **Check**: Network requests are not blocked

**Error**: "403 Forbidden" when saving data
- **Check**: RLS policies are set up correctly
- **Check**: User is authenticated
- **Check**: Database tables exist

### Image Upload Issues

**Error**: "Failed to upload image"
- **Check**: Storage buckets are created
- **Check**: Storage RLS policies are set up
- **Check**: Bucket is set to public
- **Check**: File size is under 2MB

## Post-Deployment Checklist

- [ ] Environment variables are set
- [ ] Database tables are created
- [ ] Storage buckets are created
- [ ] RLS policies are configured
- [ ] User registration works
- [ ] User login works
- [ ] Data saving works
- [ ] Data loading works
- [ ] Image uploads work
- [ ] All routes are accessible

## Support

If you encounter issues:
1. Check Vercel build logs
2. Check browser console for errors
3. Verify Supabase dashboard for database/storage status
4. Review environment variables in Vercel settings
