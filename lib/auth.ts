import { supabase } from "./supabase"
import { db } from "./database"

export interface AuthUser {
  id: string
  email: string
  name: string
}

class AuthService {
  private static instance: AuthService

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async signUp(userData: {
    firstName: string
    lastName: string
    email: string
    password: string
  }): Promise<{ success: boolean; user?: AuthUser; error?: string; needsConfirmation?: boolean }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            full_name: `${userData.firstName} ${userData.lastName}`,
          },
          // Skip email confirmation for development
          emailRedirectTo: undefined,
        },
      })

      if (error) throw error

      if (data.user) {
        // Check if email confirmation is required
        if (data.user.email_confirmed_at) {
          // User is confirmed, can sign in immediately
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email!,
            name: `${userData.firstName} ${userData.lastName}`,
          }
          return { success: true, user: authUser }
        } else {
          // Email confirmation required
          return {
            success: true,
            needsConfirmation: true,
            error: "Please check your email and click the confirmation link to complete registration.",
          }
        }
      }

      return { success: false, error: "Failed to create user" }
    } catch (error: any) {
      console.error("Signup error:", error)
      return { success: false, error: error.message || "Failed to create account" }
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Handle specific error cases
        if (error.message === "Email not confirmed") {
          return {
            success: false,
            error:
              "Please check your email and click the confirmation link before signing in. Check your spam folder if you don't see the email.",
          }
        }
        if (error.message === "Invalid login credentials") {
          return {
            success: false,
            error: "Invalid email or password. Please check your credentials and try again.",
          }
        }
        throw error
      }

      if (data.user) {
        // Wait a moment for the profile to be available
        await new Promise((resolve) => setTimeout(resolve, 100))

        const profile = await db.getUserProfile(data.user.id)

        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          name: profile?.full_name || data.user.email!,
        }

        return { success: true, user: authUser }
      }

      return { success: false, error: "Failed to sign in" }
    } catch (error: any) {
      console.error("Signin error:", error)
      return { success: false, error: error.message || "Invalid email or password" }
    }
  }

  async resendConfirmation(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error("Resend confirmation error:", error)
      return { success: false, error: error.message || "Failed to resend confirmation email" }
    }
  }

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const profile = await db.getUserProfile(user.id)

        return {
          id: user.id,
          email: user.email!,
          name: profile?.full_name || user.email!,
        }
      }

      return null
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  isAuthenticated(): boolean {
    // This will be checked in components using useEffect
    return false
  }

  async getUserStats() {
    try {
      const user = await this.getCurrentUser()
      if (!user) return null

      return await db.getUserStats(user.id)
    } catch (error) {
      console.error("Error getting user stats:", error)
      return null
    }
  }

  async exportUserData() {
    try {
      const user = await this.getCurrentUser()
      if (!user) return null

      const profile = await db.getUserProfile(user.id)
      const scans = await db.getScansByUserId(user.id)

      // Remove sensitive data for export
      const exportScans = scans.map((scan) => ({
        ...scan,
        image_url: undefined,
        thumbnail_url: undefined,
      }))

      return { user: profile, scans: exportScans }
    } catch (error) {
      console.error("Error exporting user data:", error)
      return null
    }
  }
}

export const authService = AuthService.getInstance()
