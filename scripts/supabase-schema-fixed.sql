-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.scan_history CASCADE;
DROP TABLE IF EXISTS public.scans CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.log_scan_changes();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Create user_profiles table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  medical_history TEXT[],
  allergies TEXT[],
  current_medications TEXT[],
  emergency_contact JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scans table
CREATE TABLE public.scans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Chest X-Ray', 'Brain MRI', 'CT Scan', 'Bone X-Ray', 'Ultrasound', 'Mammography')),
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'analyzed', 'error')),
  
  -- AI Analysis Results
  diagnosis TEXT,
  confidence DECIMAL(5,2) CHECK (confidence >= 0 AND confidence <= 100),
  severity TEXT CHECK (severity IN ('normal', 'mild', 'moderate', 'severe')),
  findings TEXT[],
  recommendations TEXT[],
  
  -- Prescription data
  prescription JSONB DEFAULT '{
    "medications": [],
    "lifestyle": [],
    "followUp": "",
    "warnings": []
  }'::jsonb,
  
  -- File storage
  image_url TEXT,
  thumbnail_url TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scan_history table for tracking changes
CREATE TABLE public.scan_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'analyzed', 'deleted')),
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_scans_user_id ON public.scans(user_id);
CREATE INDEX idx_scans_upload_date ON public.scans(upload_date DESC);
CREATE INDEX idx_scans_status ON public.scans(status);
CREATE INDEX idx_scans_type ON public.scans(type);
CREATE INDEX idx_scans_severity ON public.scans(severity);
CREATE INDEX idx_scan_history_scan_id ON public.scan_history(scan_id);
CREATE INDEX idx_scan_history_user_id ON public.scan_history(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scans_updated_at 
  BEFORE UPDATE ON public.scans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user profile
-- This function runs with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for new user signup (this will handle profile creation automatically)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Note: We don't need INSERT policy because the trigger handles profile creation

-- Create RLS policies for scans
CREATE POLICY "Users can view own scans" ON public.scans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans" ON public.scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans" ON public.scans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans" ON public.scans
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for scan_history
CREATE POLICY "Users can view own scan history" ON public.scan_history
  FOR SELECT USING (auth.uid() = user_id);

-- Create function to log scan changes
CREATE OR REPLACE FUNCTION public.log_scan_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.scan_history (scan_id, user_id, action, changes)
    VALUES (NEW.id, NEW.user_id, 'created', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.scan_history (scan_id, user_id, action, changes)
    VALUES (NEW.id, NEW.user_id, 'updated', jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.scan_history (scan_id, user_id, action, changes)
    VALUES (OLD.id, OLD.user_id, 'deleted', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for scan changes
CREATE TRIGGER log_scan_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.scans
  FOR EACH ROW EXECUTE FUNCTION public.log_scan_changes();
