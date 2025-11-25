# User Registration Guide

## How Users Can Register and Create Accounts

### Registration Flow

1. **Access the Registration Form**
   - Users navigate to any CMS route (e.g., `http://localhost:3000/myclik/studio`)
   - If not authenticated, they will see the authentication form
   - The form defaults to "Sign In" mode

2. **Switch to Registration Mode**
   - Click the "Sign up" link at the bottom of the login form
   - The form will switch to registration mode

3. **Fill in Registration Details**
   - **Email**: Enter a valid email address
   - **Password**: Enter a password (minimum 6 characters)
   - **Confirm Password**: Re-enter the password to confirm

4. **Submit Registration**
   - Click "Create Account" button
   - The system will:
     - Validate email format
     - Validate password length (minimum 6 characters)
     - Check that passwords match
     - Create account in Supabase Auth
     - Create user profile in database (if database is set up)
     - Link user code to the new account

5. **Email Verification (if enabled)**
   - If email confirmation is enabled in Supabase, user will receive a verification email
   - User must click the verification link in the email before they can log in
   - After verification, user can sign in normally

6. **Automatic Login (if email confirmation disabled)**
   - If email confirmation is disabled, user can immediately sign in
   - The form will automatically switch back to "Sign In" mode after successful registration

### Supabase Configuration

To control the registration behavior, configure these settings in your Supabase Dashboard:

1. **Go to**: Authentication → Settings → Email Auth
2. **Email Confirmation**:
   - **Enabled**: Users must verify email before logging in (recommended for production)
   - **Disabled**: Users can log in immediately after registration (useful for development)

3. **Email Templates**:
   - Customize the confirmation email template in Authentication → Email Templates
   - Default template includes a confirmation link

### Registration Requirements

- **Email**: Must be a valid email format
- **Password**: Minimum 6 characters
- **Password Confirmation**: Must match the password

### What Gets Created

When a user registers:

1. **Supabase Auth User**:
   - User account in `auth.users` table
   - Email and password stored securely
   - Unique user ID (UUID)

2. **User Profile** (if database is set up):
   - Profile record in `user_profiles` table
   - Links Supabase user ID to user code
   - Stores email and user code

3. **User Code**:
   - If user has existing user code in localStorage, it's linked to the new account
   - If no existing user code, a new one is generated and linked

### Troubleshooting

**Issue**: User can't register
- **Check**: Supabase project is active and credentials are correct
- **Check**: Database table `user_profiles` exists (see `SUPABASE_DATABASE_SETUP.md`)
- **Check**: Environment variables are set correctly

**Issue**: User receives error "Email already registered"
- **Solution**: User should use "Sign In" instead, or use password reset if they forgot their password

**Issue**: User doesn't receive verification email
- **Check**: Email confirmation is enabled in Supabase settings
- **Check**: Check spam folder
- **Check**: Email service is configured in Supabase (SMTP settings)

**Issue**: User profile not created after registration
- **Check**: Database table `user_profiles` exists
- **Check**: RLS policies allow INSERT operations
- **Check**: Trigger is set up (if using auto-create trigger)

### Development vs Production

**Development** (Email confirmation disabled):
- Users can register and immediately log in
- Faster for testing
- Less secure

**Production** (Email confirmation enabled):
- Users must verify email before logging in
- More secure
- Prevents fake email registrations
- Recommended for production use

### Testing Registration

1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/myclik/studio`
3. Click "Sign up" link
4. Enter test email and password
5. Click "Create Account"
6. Check Supabase Dashboard → Authentication → Users to see the new user
7. Check `user_profiles` table to see the user profile (if database is set up)


