-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scans table
CREATE TABLE public.scans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'analyzed', 'error')),
  diagnosis TEXT,
  confidence DECIMAL(5,2),
  severity TEXT,
  findings TEXT[],
  recommendations TEXT[],
  prescription JSONB,
  image_url TEXT,
  thumbnail_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_scans_user_id ON public.scans(user_id);
CREATE INDEX idx_scans_upload_date ON public.scans(upload_date DESC);
CREATE INDEX idx_scans_status ON public.scans(status);
CREATE INDEX idx_scans_type ON public.scans(type);

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

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for scans
CREATE POLICY "Users can view own scans" ON public.scans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans" ON public.scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans" ON public.scans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans" ON public.scans
  FOR DELETE USING (auth.uid() = user_id);
