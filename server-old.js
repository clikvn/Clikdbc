import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Initialize Supabase client with service role key (for backend operations)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL or VITE_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to generate a unique user code
function generateUserCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    console.log('=== Registration Request ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const { email, password, name, title } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Validation failed: Email or password missing');
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    if (password.length < 6) {
      console.log('Validation failed: Password too short');
      return res.status(400).json({
        error: 'Password must be at least 6 characters'
      });
    }

    if (!email.includes('@')) {
      console.log('Validation failed: Invalid email format');
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }
    
    console.log('Input validation passed');

    // Step 1: Check if user profile already exists (not just auth user)
    // A user might exist in auth.users but not have a profile if registration failed
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('email', email)
      .single();
    
    if (existingProfile) {
      return res.status(400).json({
        error: 'A user with this email address has already been registered. Please sign in instead.',
        code: 'EMAIL_EXISTS'
      });
    }

    // Step 2: Create auth user in Supabase
    // Note: admin.createUser requires the service role key
    console.log('Creating auth user for:', email);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email (for development)
      user_metadata: {
        name: name || '',
        title: title || ''
      }
    });

    if (authError) {
      console.error('Error creating auth user:', JSON.stringify(authError, null, 2));
      
      // Check if error is due to existing user
      if (authError.message?.includes('already registered') || 
          authError.message?.includes('already exists') ||
          authError.message?.includes('User already registered')) {
        // User exists in auth but might not have profile - check profile
        const { data: profileCheck } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('email', email)
          .single();
        
        if (profileCheck) {
          // Profile exists, user is fully registered
          return res.status(400).json({
            error: 'A user with this email address has already been registered. Please sign in instead.',
            code: 'EMAIL_EXISTS'
          });
        } else {
          // User exists in auth but no profile - recover by creating profile
          console.log('User exists in auth but no profile found. Attempting to recover...');
          const { data: users } = await supabase.auth.admin.listUsers();
          const existingAuthUser = users?.users?.find(u => u.email === email);
          
          if (existingAuthUser) {
            // Use existing auth user and create profile - set variables for continuation
            console.log('Found existing auth user, creating profile...');
            const recoveredUserId = existingAuthUser.id;
            
            // Generate user code
            let recoveredUserCode = generateUserCode();
            let attempts = 0;
            const maxAttempts = 10;
            
            while (attempts < maxAttempts) {
              const { data: existing } = await supabase
                .from('user_profiles')
                .select('user_code')
                .eq('user_code', recoveredUserCode)
                .single();
              
              if (!existing) break;
              recoveredUserCode = generateUserCode();
              attempts++;
            }
            
            if (attempts >= maxAttempts) {
              return res.status(500).json({
                error: 'Failed to generate unique user code. Please try again.'
              });
            }
            
            // Create profile for existing auth user
            const { data: recoveredProfile, error: profileError } = await supabase
              .from('user_profiles')
              .insert([{
                id: recoveredUserId,
                user_code: recoveredUserCode,
                email: email
              }])
              .select()
              .single();
            
            if (profileError) {
              console.error('Error creating profile for existing user:', profileError);
              return res.status(500).json({
                error: 'Account exists but profile creation failed. Please contact support.',
                code: 'PROFILE_CREATION_FAILED'
              });
            }
            
            // Set variables to continue with user_home creation and sign in
            userId = recoveredUserId;
            userCode = recoveredUserCode;
            profileData = recoveredProfile;
            
            // Skip to user_home creation (Step 4)
            // We'll jump to that section after the authData check
          } else {
            return res.status(400).json({
              error: authError.message || 'Failed to create user account',
              details: authError
            });
          }
        }
      } else {
        return res.status(400).json({
          error: authError.message || 'Failed to create user account',
          details: authError
        });
      }
    }

    // Handle both new user creation and recovery of existing user
    let userId, userCode, profileData;
    
    if (authData && authData.user) {
      // New user was created successfully
      userId = authData.user.id;
    } else if (typeof userId !== 'undefined' && typeof userCode !== 'undefined' && typeof profileData !== 'undefined') {
      // Recovery path - variables already set above, continue to user_home
    } else {
      return res.status(500).json({
        error: 'User creation failed - no user returned'
      });
    }
    
    // If we're in recovery mode, skip to user_home creation
    if (typeof profileData !== 'undefined' && profileData) {
      // Profile already created in recovery, skip to Step 4
    } else {
      // Normal flow - continue with user code generation and profile creation

    // Step 2: Generate unique user code
    let userCode = generateUserCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure user_code is unique
    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('user_code')
        .eq('user_code', userCode)
        .single();

      if (!existing) {
        break; // user_code is unique
      }
      userCode = generateUserCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      // If we can't generate a unique code, delete the auth user and return error
      await supabase.auth.admin.deleteUser(userId);
      return res.status(500).json({
        error: 'Failed to generate unique user code. Please try again.'
      });
    }

      // Step 3: Create or update user profile (bypasses RLS with service role key)
      // First check if profile already exists (might have been created by trigger or recovery)
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        // Profile already exists, update it with the user_code and email
        console.log('Profile already exists, updating user_code and email');
        const { data: updatedProfile, error: updateError } = await supabase
          .from('user_profiles')
          .update({
            user_code: userCode,
            email: email
          })
          .eq('id', userId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user profile:', updateError);
          // Only delete if it's a new user (not recovered)
          if (authData && authData.user) {
            await supabase.auth.admin.deleteUser(userId);
          }
          return res.status(500).json({
            error: 'Failed to update user profile: ' + updateError.message
          });
        }
        profileData = updatedProfile;
      } else {
        // Profile doesn't exist, create it
        const { data: newProfile, error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: userId,
              user_code: userCode,
              email: email
            }
          ])
          .select()
          .single();

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Clean up: delete auth user if profile creation fails (only for new users)
          if (authData && authData.user) {
            await supabase.auth.admin.deleteUser(userId);
          }
          return res.status(500).json({
            error: 'Failed to create user profile: ' + profileError.message
          });
        }
        profileData = newProfile;
      }
    }

    // Step 4: Create user_home entry with name and title if provided
    if (name || title) {
      const personalData = {
        user_code: userCode,
        name: name ? name.trim() : '',
        title: title ? title.trim() : '',
        business_name: '',
        bio: '',
        profile_image: '',
        avatar_image: ''
      };

      const { error: homeError } = await supabase
        .from('user_home')
        .upsert(personalData, {
          onConflict: 'user_code'
        });

      if (homeError) {
        console.error('Error creating user_home:', homeError);
        // Don't fail registration if this fails, just log it
        // The profile is already created, so registration is successful
      }
    }

    // Step 5: Sign in the user and get session
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (sessionError) {
      console.error('Error signing in user:', sessionError);
      // User is created, but we couldn't sign them in
      // Return success but indicate they need to sign in manually
      return res.status(201).json({
        success: true,
        message: 'Account created successfully. Please sign in.',
        user: {
          id: userId,
          email: email,
          user_code: userCode
        },
        session: null
      });
    }

    // Success - return user data and session
    return res.status(201).json({
      success: true,
      message: 'Account created and signed in successfully',
      user: {
        id: userId,
        email: email,
        user_code: userCode
      },
      session: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        expires_at: sessionData.session.expires_at,
        expires_in: sessionData.session.expires_in,
        token_type: sessionData.session.token_type,
        user: {
          id: sessionData.user.id,
          email: sessionData.user.email
        }
      }
    });

  } catch (error) {
    console.error('Unexpected error in /api/register:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      error: 'Internal server error: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'user-registration-api'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Register endpoint: http://localhost:${PORT}/api/register`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});

