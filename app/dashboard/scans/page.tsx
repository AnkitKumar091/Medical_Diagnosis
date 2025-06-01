"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileImage, Search, Filter, Eye, Download, Calendar, ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"

const mockScans = [
  {
    id: 1,
    name: "Chest X-Ray - Routine Check",
    type: "X-Ray",
    date: "15/05/2024",
    status: "Analyzed",
    diagnosis: "Mild cardiomegaly observed",
    confidence: 91.2,
    severity: "Mild",
  },
  {
    id: 2,
    name: "Brain MRI - Headache Investigation",
    type: "MRI",
    date: "10/05/2024",
    status: "Analyzed",
    diagnosis: "Small vessel disease detected",
    confidence: 83.7,
    severity: "Mild",
  },
  {
    id: 3,
    name: "CT Scan - Abdomen",
    type: "CT Scan",
    date: "05/05/2024",
    status: "Analyzed",
    diagnosis: "Hepatic steatosis (fatty liver)",
    confidence: 92.6,
    severity: "Mild",
  },
  {
    id: 4,
    name: "Bone X-Ray - Left Wrist",
    type: "X-Ray",
    date: "01/05/2024",
    status: "Analyzed",
    diagnosis: "Hairline fracture identified",
    confidence: 94.7,
    severity: "Mild",
  },
  {
    id: 5,
    name: "Mammography - Annual Screening",
    type: "Mammography",
    date: "28/04/2024",
    status: "Analyzed",
    diagnosis: "Dense breast tissue noted",
    confidence: 93.7,
    severity: "Normal variant",
  },
  {
    id: 6,
    name: "Ultrasound - Thyroid",
    type: "Ultrasound",
    date: "20/04/2024",
    status: "Analyzed",
    diagnosis: "Thyroid nodule identified",
    confidence: 91.8,
    severity: "Indeterminate",
  },
  {
    id: 7,
    name: "Chest X-Ray - Follow-up",
    type: "X-Ray",
    date: "15/04/2024",
    status: "Analyzed",
    diagnosis: "Pneumonia detected in right lower lobe",
    confidence: 87.3,
    severity: "Moderate",
  },
  {
    id: 8,
    name: "CT Scan - Brain",
    type: "CT Scan",
    date: "10/04/2024",
    status: "Pending",
    diagnosis: "Analysis in progress",
    confidence: 0,
    severity: "Pending",
  },
]

export default function ScansPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredScans = mockScans.filter((scan) => {
    const matchesSearch =
      scan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || scan.type === filterType
    const matchesStatus = filterStatus === "all" || scan.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "analyzed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
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
        {mockScans.length > 0 ? (
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
                        <SelectItem value="X-Ray">X-Ray</SelectItem>
                        <SelectItem value="MRI">MRI</SelectItem>
                        <SelectItem value="CT Scan">CT Scan</SelectItem>
                        <SelectItem value="Ultrasound">Ultrasound</SelectItem>
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
                      <Badge className={getStatusColor(scan.status)}>{scan.status}</Badge>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{scan.name}</CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-2">
                        <Calendar className="h-4 w-4" />
                        <span>{scan.date}</span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Type:</span>
                        <Badge variant="outline">{scan.type}</Badge>
                      </div>

                      {scan.status === "Analyzed" && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Confidence:</span>
                            <span className="text-sm font-bold">{scan.confidence}%</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Severity:</span>
                            <Badge className={getSeverityColor(scan.severity)}>{scan.severity}</Badge>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Diagnosis:</span> {scan.diagnosis}
                      </p>

                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
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
                  <Button>Upload New Scan</Button>
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
    </div>
  )
}
