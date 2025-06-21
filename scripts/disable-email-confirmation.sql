-- Disable email confirmation for development
-- Run this in your Supabase SQL editor for easier development

-- Update auth settings to disable email confirmation
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_email_confirmations = false
WHERE id = 1;

-- If the above doesn't work, you can also update the auth.users table directly
-- to confirm existing users (use with caution in production)

-- Uncomment the following lines if you want to confirm all existing users:
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email_confirmed_at IS NULL;

-- Note: The preferred way is to disable email confirmation in your Supabase dashboard:
-- 1. Go to Authentication → Settings
-- 2. Under "User Signups" section
-- 3. Toggle OFF "Enable email confirmations"
