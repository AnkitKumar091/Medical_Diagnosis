import { supabase } from "./supabase"
import type { UserProfile, Scan } from "./supabase"

export class SupabaseService {
  // User Profile Operations
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

      if (error) {
        // If profile doesn't exist yet, wait a moment and try again
        if (error.code === "PGRST116") {
          await new Promise((resolve) => setTimeout(resolve, 500))
          const { data: retryData, error: retryError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", userId)
            .single()
          if (retryError) throw retryError
          return retryData
        }
        throw error
      }
      return data
    } catch (error) {
      console.error("Error getting user profile:", error)
      return null
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from("user_profiles").update(updates).eq("id", userId).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error updating user profile:", error)
      return null
    }
  }

  // Scan Operations
  async createScan(scanData: Omit<Scan, "id" | "created_at" | "updated_at">): Promise<Scan | null> {
    try {
      const { data, error } = await supabase.from("scans").insert([scanData]).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating scan:", error)
      return null
    }
  }

  async updateScan(scanId: string, updates: Partial<Scan>): Promise<Scan | null> {
    try {
      const { data, error } = await supabase.from("scans").update(updates).eq("id", scanId).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error updating scan:", error)
      return null
    }
  }

  async getScansByUserId(userId: string): Promise<Scan[]> {
    try {
      const { data, error } = await supabase
        .from("scans")
        .select("*")
        .eq("user_id", userId)
        .order("upload_date", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting scans:", error)
      return []
    }
  }

  async getScanById(scanId: string): Promise<Scan | null> {
    try {
      const { data, error } = await supabase.from("scans").select("*").eq("id", scanId).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error getting scan:", error)
      return null
    }
  }

  async deleteScan(scanId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("scans").delete().eq("id", scanId)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error deleting scan:", error)
      return false
    }
  }

  // Statistics
  async getUserStats(userId: string): Promise<{
    totalScans: number
    analyzedScans: number
    pendingScans: number
    averageConfidence: number
    lastScanDate: string | null
    scansByType: Record<string, number>
    recentActivity: Array<{
      date: string
      action: string
      scanName: string
    }>
  }> {
    try {
      const { data: scans, error } = await supabase
        .from("scans")
        .select("*")
        .eq("user_id", userId)
        .order("upload_date", { ascending: false })

      if (error) throw error

      const totalScans = scans?.length || 0
      const analyzedScans = scans?.filter((scan) => scan.status === "analyzed") || []
      const pendingScans = scans?.filter((scan) => scan.status === "pending" || scan.status === "analyzing") || []

      const averageConfidence =
        analyzedScans.length > 0
          ? analyzedScans.reduce((sum, scan) => sum + (scan.confidence || 0), 0) / analyzedScans.length
          : 0

      const lastScanDate = scans && scans.length > 0 ? scans[0].upload_date : null

      // Group scans by type
      const scansByType: Record<string, number> = {}
      scans?.forEach((scan) => {
        scansByType[scan.type] = (scansByType[scan.type] || 0) + 1
      })

      // Recent activity (last 5 scans)
      const recentActivity =
        scans?.slice(0, 5).map((scan) => ({
          date: scan.upload_date,
          action: scan.status === "analyzed" ? "Analyzed" : scan.status === "analyzing" ? "Analyzing" : "Uploaded",
          scanName: scan.name,
        })) || []

      return {
        totalScans,
        analyzedScans: analyzedScans.length,
        pendingScans: pendingScans.length,
        averageConfidence: Math.round(averageConfidence * 10) / 10,
        lastScanDate,
        scansByType,
        recentActivity,
      }
    } catch (error) {
      console.error("Error getting user stats:", error)
      return {
        totalScans: 0,
        analyzedScans: 0,
        pendingScans: 0,
        averageConfidence: 0,
        lastScanDate: null,
        scansByType: {},
        recentActivity: [],
      }
    }
  }

  // File Upload Helper - Upload to Supabase Storage
  async uploadImage(file: File, bucket = "medical-images"): Promise<string | null> {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `scans/${fileName}`

      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file)

      if (uploadError) {
        console.error("Upload error:", uploadError)
        // If storage fails, fall back to base64
        return await this.fileToBase64(file)
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      // Fall back to base64 storage
      return await this.fileToBase64(file)
    }
  }

  // Convert file to base64 for storage (fallback method)
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Create thumbnail from image
  async createThumbnail(file: File): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // Set thumbnail size
        const maxSize = 200
        let { width, height } = img

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL("image/jpeg", 0.7))
      }

      img.src = URL.createObjectURL(file)
    })
  }
}

export const db = new SupabaseService()
