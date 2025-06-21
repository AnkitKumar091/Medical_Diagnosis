"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setIsLoading(false)

      if (!session?.user) {
        router.push("/auth/signin")
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (event === "SIGNED_OUT" || !session?.user) {
        router.push("/auth/signin")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-sm px-4 sticky top-0 z-40">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">Welcome back!</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">{user.email?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
          </header>
          <div className="flex-1">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
