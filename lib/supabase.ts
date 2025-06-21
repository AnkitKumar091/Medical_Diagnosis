import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  avatar_url?: string
  phone?: string
  date_of_birth?: string
  gender?: string
  medical_history?: string[]
  allergies?: string[]
  current_medications?: string[]
  emergency_contact?: any
  created_at: string
  updated_at: string
}

export interface Scan {
  id: string
  user_id: string
  name: string
  type: string
  file_name: string
  file_size: number
  upload_date: string
  status: "pending" | "analyzing" | "analyzed" | "error"
  diagnosis?: string
  confidence?: number
  severity?: string
  findings?: string[]
  recommendations?: string[]
  prescription?: {
    medications: Array<{
      name: string
      dosage: string
      frequency: string
      duration: string
      instructions: string
      timing: string
    }>
    lifestyle: string[]
    followUp: string
    warnings: string[]
  }
  image_url?: string
  thumbnail_url?: string
  metadata?: any
  created_at: string
  updated_at: string
}
