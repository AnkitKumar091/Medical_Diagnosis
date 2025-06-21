"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileImage, Search, Filter, Eye, Download, Calendar, ArrowLeft, Upload, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { authService } from "@/lib/auth"
import { db, type Scan } from "@/lib/database"

export default function ScansPage() {
  const [scans, setScans] = useState<Scan[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadScans = async () => {
      const user = authService.getCurrentUser()
      if (!user) {
        router.push("/auth/signin")
        return
      }

      try {
        const userScans = await db.getScansByUserId(user.id)
        setScans(userScans.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()))
      } catch (error) {
        console.error("Failed to load scans:", error)
        toast({
          title: "Error",
          description: "Failed to load your scans. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadScans()
  }, [router, toast])

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      scan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (scan.diagnosis && scan.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === "all" || scan.type === filterType
    const matchesStatus = filterStatus === "all" || scan.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "analyzed":
        return "bg-green-100 text-green-800"
      case "analyzing":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "normal":
        return "bg-green-100 text-green-800"
      case "mild":
        return "bg-yellow-100 text-yellow-800"
      case "moderate":
        return "bg-orange-100 text-orange-800"
      case "severe":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDeleteScan = async (scanId: string) => {
    if (window.confirm("Are you sure you want to delete this scan? This action cannot be undone.")) {
      try {
        const success = await db.deleteScan(scanId)
        if (success) {
          setScans(scans.filter((scan) => scan.id !== scanId))
          toast({
            title: "Scan deleted",
            description: "The scan has been successfully deleted.",
          })
        } else {
          throw new Error("Failed to delete scan")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete the scan. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleViewScan = (scan: Scan) => {
    setSelectedScan(scan)
  }

  const handleDownloadReport = (scan: Scan) => {
    // Create a simple text report
    const reportContent = `
MEDICAL SCAN ANALYSIS REPORT
============================

Patient: ${authService.getCurrentUser()?.name}
Scan Name: ${scan.name}
Scan Type: ${scan.type}
Upload Date: ${formatDate(scan.uploadDate)}
Status: ${scan.status}

DIAGNOSIS:
${scan.diagnosis || "Analysis pending"}

${scan.confidence ? `CONFIDENCE: ${scan.confidence}%` : ""}
${scan.severity ? `SEVERITY: ${scan.severity}` : ""}

${
  scan.findings && scan.findings.length > 0
    ? `
KEY FINDINGS:
${scan.findings.map((finding) => `• ${finding}`).join("\n")}
`
    : ""
}

${
  scan.recommendations && scan.recommendations.length > 0
    ? `
RECOMMENDATIONS:
${scan.recommendations.map((rec) => `• ${rec}`).join("\n")}
`
    : ""
}

${
  scan.prescription && scan.prescription.medications.length > 0
    ? `
PRESCRIBED MEDICATIONS:
${scan.prescription.medications.map((med) => `• ${med.name} - ${med.dosage} - ${med.frequency}`).join("\n")}
`
    : ""
}

DISCLAIMER:
This AI-generated analysis is for informational purposes only and should not replace professional medical advice.
    `.trim()

    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${scan.name.replace(/[^a-z0-9]/gi, "_")}_report.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Report downloaded",
      description: "The scan report has been downloaded successfully.",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <FileImage className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">My Medical Scans</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        {scans.length > 0 ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filter & Search</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search scans..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Scan Type</label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Chest X-Ray">Chest X-Ray</SelectItem>
                        <SelectItem value="Brain MRI">Brain MRI</SelectItem>
                        <SelectItem value="CT Scan">CT Scan</SelectItem>
                        <SelectItem value="Bone X-Ray">Bone X-Ray</SelectItem>
                        <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                        <SelectItem value="Mammography">Mammography</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="analyzed">Analyzed</SelectItem>
                        <SelectItem value="analyzing">Analyzing</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScans.map((scan) => (
                <Card key={scan.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between">
                      <FileImage className="h-8 w-8 text-blue-600" />
                      <div className="flex space-x-2">
                        <Badge className={getStatusColor(scan.status)}>{scan.status}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteScan(scan.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{scan.name}</CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(scan.uploadDate)}</span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Type:</span>
                        <Badge variant="outline">{scan.type}</Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">File Size:</span>
                        <span className="text-sm">{(scan.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      </div>

                      {scan.status === "analyzed" && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Confidence:</span>
                            <span className="text-sm font-bold">{scan.confidence}%</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Severity:</span>
                            <Badge className={getSeverityColor(scan.severity || "")}>{scan.severity}</Badge>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Diagnosis:</span> {scan.diagnosis || "Analysis pending"}
                      </p>

                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1" onClick={() => handleViewScan(scan)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {scan.status === "analyzed" && (
                          <Button size="sm" variant="outline" onClick={() => handleDownloadReport(scan)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredScans.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <FileImage className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No scans found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || filterType !== "all" || filterStatus !== "all"
                      ? "Try adjusting your search or filters"
                      : "Upload your first medical image to get started"}
                  </p>
                  <Link href="/dashboard/upload">
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New Scan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <FileImage className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <CardTitle className="text-xl mb-2">No scans uploaded yet</CardTitle>
              <CardDescription className="mb-6">
                Upload your first medical image to get started with AI-powered analysis
              </CardDescription>
              <Link href="/dashboard/upload">
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First Scan
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Scan Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedScan.name}</h2>
                  <p className="text-gray-600">{formatDate(selectedScan.uploadDate)}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedScan(null)}>
                  ×
                </Button>
              </div>

              {selectedScan.imageData && (
                <div className="mb-6">
                  <img
                    src={selectedScan.imageData || "/placeholder.svg"}
                    alt={selectedScan.name}
                    className="max-w-full h-auto rounded-lg border"
                  />
                </div>
              )}

              {selectedScan.status === "analyzed" && (
                <div className="space-y-6">
                  {/* Diagnosis */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Diagnosis</h3>
                    <p className="text-blue-800">{selectedScan.diagnosis}</p>
                    <p className="text-sm text-blue-600 mt-1">Confidence: {selectedScan.confidence}%</p>
                  </div>

                  {/* Findings */}
                  {selectedScan.findings && selectedScan.findings.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Key Findings</h3>
                      <ul className="space-y-2">
                        {selectedScan.findings.map((finding, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-green-600">•</span>
                            <span className="text-sm">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {selectedScan.recommendations && selectedScan.recommendations.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Recommendations</h3>
                      <ul className="space-y-2">
                        {selectedScan.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-orange-600">•</span>
                            <span className="text-sm">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex space-x-4">
                <Button onClick={() => setSelectedScan(null)}>Close</Button>
                {selectedScan.status === "analyzed" && (
                  <Button variant="outline" onClick={() => handleDownloadReport(selectedScan)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
