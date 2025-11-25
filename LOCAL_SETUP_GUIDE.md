# Local Development Setup Guide

## Quick Start

1. **Install Dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**:
   - Create a `.env` file in the root directory
   - Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   - Get these values from: https://app.supabase.com/project/YOUR_PROJECT/settings/api

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   - Open your browser to: `http://localhost:3000`
   - Default route: `http://localhost:3000/myclik`

## Setting Up Supabase

### 1. Create a Supabase Project
- Go to https://app.supabase.com
- Create a new project
- Wait for the project to be fully provisioned

### 2. Get Your API Credentials
- Go to: Settings → API
- Copy:
  - **Project URL** → `VITE_SUPABASE_URL`
  - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 3. Set Up Database
- Follow the instructions in `SUPABASE_DATABASE_SETUP.md`
- Create the `user_profiles` table
- Set up Row Level Security (RLS) policies

### 4. Configure Authentication
- Go to: Authentication → Settings → Email Auth
- For development: Disable "Confirm email" (users can log in immediately)
- For production: Enable "Confirm email" (users must verify email)

## Testing Registration

1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/myclik/studio`
3. You should see the authentication form
4. Click "Sign up" to register a new account
5. Enter email and password
6. Click "Create Account"

## Troubleshooting

### Server Won't Start
- **Error**: "Missing Supabase environment variables"
  - **Solution**: Create `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Can't Register Users
- **Check**: Supabase project is active
- **Check**: Database table `user_profiles` exists
- **Check**: RLS policies are set up correctly

### Port Already in Use
- **Solution**: Kill the process using port 3000:
  ```bash
   # Windows PowerShell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Development URLs

- **Home**: `http://localhost:3000/myclik`
- **CMS/Studio**: `http://localhost:3000/myclik/studio`
- **Edit Home**: `http://localhost:3000/myclik/studio/home`
- **Edit Contact**: `http://localhost:3000/myclik/studio/contact`
- **Edit Profile**: `http://localhost:3000/myclik/studio/profile`
- **Edit Portfolio**: `http://localhost:3000/myclik/studio/portfolio`

