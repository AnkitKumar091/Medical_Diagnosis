"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileImage, Brain, Activity, Clock, TrendingUp, Shield, HardDrive } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { authService, type AuthUser } from "@/lib/auth"
import { db } from "@/lib/database"

export default function Dashboard() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [stats, setStats] = useState({
    totalScans: 0,
    analyzedScans: 0,
    pendingScans: 0,
    averageConfidence: 0,
    lastScanDate: null as string | null,
    scansByType: {} as Record<string, number>,
    recentActivity: [] as Array<{
      date: string
      action: string
      scanName: string
    }>,
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = authService.getCurrentUser()
        console.log("Dashboard - Current user:", currentUser)

        if (currentUser) {
          setUser(currentUser)
          try {
            // Load user stats
            const userStats = await db.getUserStats(currentUser.id)
            setStats(userStats)

            console.log("Dashboard data loaded successfully")
          } catch (error) {
            console.error("Failed to load dashboard data:", error)
            toast({
              title: "Warning",
              description: "Some dashboard data could not be loaded.",
              variant: "destructive",
            })
          }
        } else {
          console.log("Dashboard - No user found, redirecting")
          router.push("/auth/signin")
          return
        }
      } catch (error) {
        console.error("Dashboard - Error loading user data:", error)
        router.push("/auth/signin")
        return
      } finally {
        setIsLoading(false)
      }
    }

    setTimeout(loadUserData, 200)
  }, [router, toast])

  const formatLastScanDate = (dateString: string | null) => {
    if (!dateString) return "Never"

    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const handleExportData = async () => {
    try {
      const userData = await authService.exportUserData()
      if (userData) {
        const dataStr = JSON.stringify(userData, null, 2)
        const dataBlob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `mediscan_data_${user?.email}_${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast({
          title: "Data exported",
          description: "Your medical data has been exported successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      })
    }
  }

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
    <div className="space-y-6 lg:space-y-8 p-4 lg:p-6">
      {/* Welcome Section */}
      <div className="text-center space-y-4 py-6 lg:py-8">
        <div className="inline-flex items-center space-x-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Brain className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
            <p className="text-gray-600 text-sm lg:text-base">
              Your medical data is securely stored and ready for analysis
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200">
          <Link href="/dashboard/upload" className="block h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-lg font-semibold text-blue-900">Upload New Scan</CardTitle>
                <CardDescription className="text-blue-700 text-sm">Start AI analysis</CardDescription>
              </div>
              <div className="p-3 bg-blue-200 rounded-xl">
                <Upload className="h-6 w-6 text-blue-700" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800">
                Upload X-rays, MRI, CT scans, or other medical images for instant AI analysis
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200">
          <Link href="/dashboard/scans" className="block h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-lg font-semibold text-green-900">My Scans</CardTitle>
                <CardDescription className="text-green-700 text-sm">View all results</CardDescription>
              </div>
              <div className="p-3 bg-green-200 rounded-xl">
                <FileImage className="h-6 w-6 text-green-700" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-800">
                View and manage your uploaded medical images and AI analysis results
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 md:col-span-2 xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-lg font-semibold text-purple-900">AI Analysis</CardTitle>
              <CardDescription className="text-purple-700 text-sm">YOLOv8 powered</CardDescription>
            </div>
            <div className="p-3 bg-purple-200 rounded-xl">
              <Brain className="h-6 w-6 text-purple-700" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-800">
              Advanced YOLOv8 model provides accurate medical image interpretation with detailed prescriptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Personal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Scans</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileImage className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalScans}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.totalScans === 0
                ? "Upload your first medical scan"
                : stats.totalScans === 1
                  ? "1 medical image uploaded"
                  : `${stats.totalScans} medical images uploaded`}
            </p>
            {stats.totalScans > 0 && (
              <div className="mt-2 flex items-center text-xs text-blue-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>Ready for analysis</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">AI Analyses</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <Brain className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.analyzedScans}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.analyzedScans === 0
                ? "No AI analyses completed yet"
                : stats.analyzedScans === 1
                  ? "1 scan analyzed by AI"
                  : `${stats.analyzedScans} scans analyzed by AI`}
            </p>
            {stats.totalScans > 0 && (
              <div className="mt-2 flex items-center text-xs">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.analyzedScans / stats.totalScans) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-green-600 font-medium">
                  {Math.round((stats.analyzedScans / stats.totalScans) * 100)}%
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">AI Confidence</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900">
              {stats.averageConfidence > 0 ? `${stats.averageConfidence}%` : "--"}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.averageConfidence > 0 ? "Average AI model accuracy" : "Complete an analysis to see confidence"}
            </p>
            {stats.averageConfidence > 0 && (
              <div className="mt-2 flex items-center text-xs">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      stats.averageConfidence >= 90
                        ? "bg-green-500"
                        : stats.averageConfidence >= 80
                          ? "bg-yellow-500"
                          : "bg-orange-500"
                    }`}
                    style={{ width: `${stats.averageConfidence}%` }}
                  ></div>
                </div>
                <span
                  className={`ml-2 font-medium ${
                    stats.averageConfidence >= 90
                      ? "text-green-600"
                      : stats.averageConfidence >= 80
                        ? "text-yellow-600"
                        : "text-orange-600"
                  }`}
                >
                  {stats.averageConfidence >= 90 ? "Excellent" : stats.averageConfidence >= 80 ? "Good" : "Fair"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Last Activity</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg lg:text-2xl font-bold text-gray-900">{formatLastScanDate(stats.lastScanDate)}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.lastScanDate ? "Most recent scan upload" : "No scans uploaded yet"}
            </p>
            {stats.lastScanDate && (
              <div className="mt-2 flex items-center text-xs text-orange-600">
                <Activity className="h-3 w-3 mr-1" />
                <span>
                  {(() => {
                    if (!stats.lastScanDate) return "No activity"
                    const date = new Date(stats.lastScanDate)
                    const now = new Date()
                    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

                    if (diffInHours < 1) return "Very active"
                    if (diffInHours < 24) return "Recently active"
                    if (diffInHours < 168) return "Active this week"
                    return "Check back soon"
                  })()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      {stats.totalScans > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scan Types Breakdown */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileImage className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-indigo-900">Scan Types</CardTitle>
                  <CardDescription className="text-indigo-700">Breakdown of your medical images</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(stats.scansByType).length > 0 ? (
                Object.entries(stats.scansByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                        <span className="font-medium text-indigo-900">{type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-indigo-700 font-bold">{count}</span>
                        <span className="text-xs text-indigo-600">
                          ({Math.round((count / stats.totalScans) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-indigo-700 text-center py-4">No scan data available</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Activity className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-emerald-900">Recent Activity</CardTitle>
                  <CardDescription className="text-emerald-700">Your latest scan activities</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 bg-white rounded-lg border border-emerald-200"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.action === "Analyzed"
                          ? "bg-green-500"
                          : activity.action === "Analyzing"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                      }`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-emerald-900 truncate">{activity.scanName}</p>
                      <p className="text-sm text-emerald-700">{activity.action}</p>
                    </div>
                    <div className="text-xs text-emerald-600">{formatLastScanDate(activity.date)}</div>
                  </div>
                ))
              ) : (
                <p className="text-emerald-700 text-center py-4">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Status Overview */}
      {stats.totalScans > 0 && (
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-blue-900">Analysis Overview</CardTitle>
                  <CardDescription className="text-blue-700">Current status of your medical scans</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">
                  {stats.analyzedScans}/{stats.totalScans}
                </div>
                <div className="text-sm text-blue-700">Completed</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.analyzedScans}</div>
                <div className="text-sm text-green-700 font-medium">Analyzed</div>
                <div className="text-xs text-green-600 mt-1">AI analysis complete</div>
              </div>

              <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.pendingScans}</div>
                <div className="text-sm text-yellow-700 font-medium">Pending</div>
                <div className="text-xs text-yellow-600 mt-1">Awaiting analysis</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {stats.averageConfidence > 0 ? `${stats.averageConfidence}%` : "--"}
                </div>
                <div className="text-sm text-purple-700 font-medium">Avg Confidence</div>
                <div className="text-xs text-purple-600 mt-1">
                  {stats.averageConfidence >= 90
                    ? "Excellent accuracy"
                    : stats.averageConfidence >= 80
                      ? "Good accuracy"
                      : stats.averageConfidence > 0
                        ? "Fair accuracy"
                        : "No data yet"}
                </div>
              </div>
            </div>

            {stats.pendingScans > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">
                    You have {stats.pendingScans} scan{stats.pendingScans > 1 ? "s" : ""} waiting for analysis
                  </span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Upload new scans to get instant AI-powered medical analysis and prescriptions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data Management */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-white">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <HardDrive className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Data Management</CardTitle>
              <CardDescription>Manage your medical data and account settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">✅ Persistent Storage</h4>
              <p className="text-sm text-blue-700 mb-3">
                Your account, scans, and analysis results are permanently stored and will persist across browser
                sessions.
              </p>
              <Button onClick={handleExportData} variant="outline" size="sm" className="w-full">
                <HardDrive className="h-4 w-4 mr-2" />
                Export My Data
              </Button>
            </div>

            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">🔒 Secure Database</h4>
              <p className="text-sm text-green-700 mb-3">
                All your medical images and personal information are securely encrypted and stored with enterprise-grade
                security.
              </p>
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Shield className="h-4 w-4" />
                <span>HIPAA Compliant Storage</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-white">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Getting Started Guide</CardTitle>
              <CardDescription>Follow these steps to analyze your medical images</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Upload Medical Image</h4>
                <p className="text-sm text-blue-700">Click "Upload New Scan" to get started with AI analysis</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-green-900 mb-1">AI Analysis</h4>
                <p className="text-sm text-green-700">Our YOLOv8 AI will analyze your image automatically</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-purple-900 mb-1">Review Results</h4>
                <p className="text-sm text-purple-700">View detailed analysis and potential prescriptions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
