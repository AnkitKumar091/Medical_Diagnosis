"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  FileImage,
  Brain,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Pill,
  Calendar,
  Clock,
  Shield,
  Activity,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { db } from "@/lib/database"
import type { Scan } from "@/lib/supabase"

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [scanType, setScanType] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [currentScan, setCurrentScan] = useState<Scan | null>(null)
  const [user, setUser] = useState<any>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/signin")
      } else {
        setUser(user)
      }
    }

    getUser()
  }, [router])

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/dicom"]
        if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith(".dcm")) {
          toast({
            title: "Invalid file type",
            description: "Please upload a valid medical image (JPEG, PNG, WebP, or DICOM).",
            variant: "destructive",
          })
          return
        }

        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please upload a file smaller than 50MB.",
            variant: "destructive",
          })
          return
        }

        setSelectedFile(file)
        setAnalysisResult(null)
        setCurrentScan(null)

        // Create image preview
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    },
    [toast],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file) {
        const mockEvent = {
          target: { files: [file] },
        } as unknown as React.ChangeEvent<HTMLInputElement>
        handleFileSelect(mockEvent)
      }
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const analyzeImage = async () => {
    if (!selectedFile || !scanType || !user) {
      toast({
        title: "Missing information",
        description: "Please select a file and scan type before analyzing.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setProgress(0)

    try {
      // Upload image to storage and create thumbnail
      const [imageUrl, thumbnailUrl] = await Promise.all([
        db.uploadImage(selectedFile),
        db.createThumbnail(selectedFile),
      ])

      if (!imageUrl) {
        throw new Error("Failed to upload image")
      }

      // Create scan record in database
      const newScan = await db.createScan({
        user_id: user.id,
        name: selectedFile.name.replace(/\.[^/.]+$/, "") + ` - ${getScanTypeLabel(scanType)}`,
        type: getScanTypeLabel(scanType),
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        upload_date: new Date().toISOString(),
        status: "pending",
        image_url: imageUrl,
        thumbnail_url: thumbnailUrl,
        metadata: {
          originalFileName: selectedFile.name,
          fileType: selectedFile.type,
          uploadedAt: new Date().toISOString(),
        },
      })

      if (!newScan) {
        throw new Error("Failed to create scan record")
      }

      setCurrentScan(newScan)

      // Update scan status to analyzing
      await db.updateScan(newScan.id, { status: "analyzing" })

      // Simulate AI analysis progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + Math.random() * 15 + 5
        })
      }, 300)

      // Simulate API call to YOLOv8 model
      const analysisTime = Math.random() * 2000 + 3000 // 3-5 seconds
      setTimeout(async () => {
        clearInterval(interval)
        setProgress(100)

        // Generate mock analysis results
        const result = generateMockAnalysis(scanType)
        setAnalysisResult(result)

        // Update scan with analysis results
        await db.updateScan(newScan.id, {
          status: "analyzed",
          diagnosis: result.diagnosis,
          confidence: result.confidence,
          severity: result.severity,
          findings: result.findings,
          recommendations: result.recommendations,
          prescription: result.prescription,
        })

        setIsAnalyzing(false)

        toast({
          title: "Analysis complete!",
          description: "Your medical image has been successfully analyzed and saved to your account.",
        })
      }, analysisTime)
    } catch (error) {
      console.error("Failed to analyze image:", error)
      setIsAnalyzing(false)
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getScanTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "chest-xray": "Chest X-Ray",
      "brain-mri": "Brain MRI",
      "ct-scan": "CT Scan",
      "bone-xray": "Bone X-Ray",
      ultrasound: "Ultrasound",
      mammography: "Mammography",
    }
    return labels[type] || type
  }

  const generateMockAnalysis = (scanType: string) => {
    const mockResults = {
      "chest-xray": {
        diagnosis:
          Math.random() > 0.7
            ? "Bacterial Pneumonia detected in right lower lobe"
            : Math.random() > 0.4
              ? "Mild cardiomegaly with possible heart failure"
              : "Normal chest X-ray findings",
        confidence: Math.random() > 0.7 ? 89.5 : Math.random() > 0.4 ? 92.8 : 97.2,
        findings:
          Math.random() > 0.7
            ? [
                "Dense consolidation in right lower lobe consistent with bacterial pneumonia",
                "Air bronchograms visible within the consolidation",
                "Blunting of right costophrenic angle suggesting pleural effusion",
                "Heart size within normal limits",
                "No pneumothorax detected",
              ]
            : Math.random() > 0.4
              ? [
                  "Enlarged cardiac silhouette (cardiothoracic ratio 0.52)",
                  "Pulmonary vascular congestion",
                  "Bilateral lower lobe haziness",
                  "No acute infiltrates",
                  "Costophrenic angles are sharp",
                ]
              : [
                  "Clear lung fields bilaterally",
                  "Normal heart size and contour",
                  "Sharp costophrenic angles",
                  "No pleural effusion or pneumothorax",
                  "Normal mediastinal contours",
                ],
        severity: Math.random() > 0.7 ? "moderate" : Math.random() > 0.4 ? "mild" : "normal",
        recommendations:
          Math.random() > 0.7
            ? [
                "Immediate antibiotic therapy recommended",
                "Follow-up chest X-ray in 48-72 hours",
                "Monitor oxygen saturation and respiratory status",
                "Consider hospitalization if symptoms worsen",
              ]
            : Math.random() > 0.4
              ? [
                  "Echocardiogram recommended for cardiac function assessment",
                  "Monitor blood pressure and fluid status",
                  "Follow up with cardiologist within 1-2 weeks",
                  "Consider diuretic therapy if indicated",
                ]
              : [
                  "Continue routine preventive care",
                  "Annual chest X-ray screening as appropriate",
                  "Follow up with primary care physician as scheduled",
                ],
        prescription:
          Math.random() > 0.7
            ? {
                medications: [
                  {
                    name: "Amoxicillin-Clavulanate (Augmentin)",
                    dosage: "875mg/125mg",
                    frequency: "Twice daily",
                    duration: "7-10 days",
                    instructions:
                      "Take with food to minimize gastrointestinal upset. Complete full course even if symptoms improve.",
                    timing: "Morning and evening with meals",
                  },
                  {
                    name: "Acetaminophen (Tylenol)",
                    dosage: "650mg",
                    frequency: "Every 6 hours as needed",
                    duration: "As needed for fever/pain",
                    instructions: "Do not exceed 3000mg in 24 hours. Monitor liver function if used long-term.",
                    timing: "As needed for symptoms",
                  },
                ],
                lifestyle: [
                  "Complete bed rest for first 48-72 hours",
                  "Increase fluid intake to 8-10 glasses of water daily",
                  "Use humidifier or steam inhalation 2-3 times daily",
                  "Avoid smoking and secondhand smoke completely",
                ],
                followUp:
                  "Return for follow-up in 48-72 hours or immediately if breathing difficulty worsens, fever persists above 101°F, or chest pain increases",
                warnings: [
                  "Complete the full antibiotic course even if feeling better",
                  "Seek immediate medical attention if experiencing severe shortness of breath",
                  "Monitor for allergic reactions to antibiotics (rash, swelling, difficulty breathing)",
                ],
              }
            : {
                medications: [],
                lifestyle: [
                  "Continue healthy lifestyle habits",
                  "Regular aerobic exercise 150 minutes per week",
                  "Maintain balanced diet rich in fruits and vegetables",
                  "Avoid smoking and limit alcohol consumption",
                ],
                followUp: "Routine follow-up with primary care physician as scheduled",
                warnings: [],
              },
      },
      "brain-mri": {
        diagnosis:
          Math.random() > 0.6
            ? "Small vessel ischemic changes consistent with microvascular disease"
            : Math.random() > 0.3
              ? "Mild cerebral atrophy consistent with age-related changes"
              : "Normal brain MRI findings",
        confidence: Math.random() > 0.6 ? 91.7 : Math.random() > 0.3 ? 88.4 : 96.1,
        findings:
          Math.random() > 0.6
            ? [
                "Multiple small hyperintense lesions in periventricular white matter",
                "T2/FLAIR hyperintensities in subcortical regions",
                "No acute infarction or hemorrhage",
                "Ventricular system normal in size",
                "No mass effect or midline shift",
              ]
            : Math.random() > 0.3
              ? [
                  "Mild generalized cerebral volume loss",
                  "Prominent sulci and ventricles for age",
                  "No focal lesions identified",
                  "Normal gray-white matter differentiation",
                  "No evidence of acute pathology",
                ]
              : [
                  "Normal brain parenchyma",
                  "No abnormal signal intensities",
                  "Normal ventricular system",
                  "No mass lesions or hemorrhage",
                  "Intact blood-brain barrier",
                ],
        severity: Math.random() > 0.6 ? "mild" : Math.random() > 0.3 ? "mild" : "normal",
        recommendations:
          Math.random() > 0.6
            ? [
                "Optimize cardiovascular risk factors",
                "Blood pressure management crucial",
                "Consider antiplatelet therapy",
                "Cognitive assessment recommended",
              ]
            : Math.random() > 0.3
              ? [
                  "Routine monitoring with annual follow-up",
                  "Maintain cognitive stimulation activities",
                  "Regular exercise and healthy diet",
                  "Monitor for any new neurological symptoms",
                ]
              : ["Continue routine care", "No immediate follow-up required", "Maintain healthy lifestyle"],
        prescription: {
          medications: [],
          lifestyle: [
            "Continue healthy lifestyle habits",
            "Regular mental stimulation and social activities",
            "Maintain physical exercise routine",
            "Balanced nutrition with brain-healthy foods",
          ],
          followUp: "Routine follow-up as needed",
          warnings: [],
        },
      },
    }

    return mockResults[scanType as keyof typeof mockResults] || mockResults["chest-xray"]
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Medical Analysis</h1>
                <p className="text-sm text-gray-600">Upload and analyze medical images</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Upload className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Select Medical Image</CardTitle>
                    <CardDescription>Drag and drop your medical image or click to browse</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 lg:p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="max-w-full max-h-48 mx-auto rounded-lg border shadow-sm"
                        />
                        <p className="text-sm text-gray-600">Click to change image</p>
                      </div>
                    ) : (
                      <>
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <Upload className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-medium text-gray-900">Drop your medical image here</p>
                          <p className="text-sm text-gray-500">Supports JPEG, PNG, WebP, DICOM • Max size 50MB</p>
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*,.dcm"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {selectedFile && (
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileImage className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-green-900 truncate">{selectedFile.name}</p>
                      <p className="text-sm text-green-700">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="scan-type" className="text-base font-medium">
                    Scan Type
                  </Label>
                  <Select value={scanType} onValueChange={setScanType}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select the type of medical scan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chest-xray">🫁 Chest X-Ray</SelectItem>
                      <SelectItem value="brain-mri">🧠 Brain MRI</SelectItem>
                      <SelectItem value="ct-scan">🔍 CT Scan</SelectItem>
                      <SelectItem value="bone-xray">🦴 Bone X-Ray</SelectItem>
                      <SelectItem value="ultrasound">📡 Ultrasound</SelectItem>
                      <SelectItem value="mammography">🩺 Mammography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={analyzeImage}
                  disabled={!selectedFile || !scanType || isAnalyzing}
                  className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Brain className="h-5 w-5 mr-2 animate-pulse" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-2" />
                      Analyze with AI
                    </>
                  )}
                </Button>

                {isAnalyzing && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-900">AI Analysis Progress</span>
                      <span className="text-blue-700 font-bold">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full h-3" />
                    <div className="flex items-center space-x-2 text-blue-700">
                      <Activity className="h-4 w-4 animate-pulse" />
                      <p className="text-sm">YOLOv8 model is analyzing your medical image...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Analysis Results</CardTitle>
                    <CardDescription>Detailed analysis from our advanced YOLOv8 medical AI model</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!analysisResult ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Brain className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium mb-2">Ready for Analysis</p>
                    <p className="text-sm">Upload and analyze an image to see results here</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Diagnosis */}
                    <div className="p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="p-1 bg-blue-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-blue-900 text-lg">Primary Diagnosis</h3>
                      </div>
                      <p className="text-blue-800 mb-3 leading-relaxed">{analysisResult.diagnosis}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-700">
                            Confidence: <strong>{analysisResult.confidence}%</strong>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-700">
                            Severity: <strong>{analysisResult.severity}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Findings */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 text-lg flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Key Clinical Findings</span>
                      </h3>
                      <div className="grid gap-3">
                        {analysisResult.findings.map((finding: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-green-800 leading-relaxed">{finding}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 text-lg flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        <span>Clinical Recommendations</span>
                      </h3>
                      <div className="grid gap-3">
                        {analysisResult.recommendations.map((recommendation: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
                          >
                            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-orange-800 leading-relaxed">{recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Prescription Section */}
        {analysisResult && analysisResult.prescription && (
          <div className="mt-8">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Pill className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-purple-900">AI-Generated Treatment Plan</CardTitle>
                    <CardDescription className="text-purple-700">
                      Personalized treatment recommendations based on AI analysis. Always consult with your healthcare
                      provider.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Medications */}
                {analysisResult.prescription.medications.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-purple-900 flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Pill className="h-5 w-5 text-purple-600" />
                      </div>
                      <span>Prescribed Medications</span>
                    </h3>
                    <div className="grid gap-6">
                      {analysisResult.prescription.medications.map((med: any, index: number) => (
                        <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-purple-200">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 space-y-3 lg:space-y-0">
                            <div>
                              <h4 className="font-bold text-xl text-purple-900 mb-1">{med.name}</h4>
                              <p className="text-purple-700 text-sm">Generic and brand name included</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
                                {med.dosage}
                              </span>
                              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                                {med.frequency}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                              <Clock className="h-5 w-5 text-purple-600" />
                              <div>
                                <p className="text-sm font-medium text-purple-900">Timing</p>
                                <p className="text-sm text-purple-700">{med.timing}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                              <Calendar className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-sm font-medium text-blue-900">Duration</p>
                                <p className="text-sm text-blue-700">{med.duration}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg md:col-span-2 lg:col-span-1">
                              <Shield className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="text-sm font-medium text-green-900">Safety</p>
                                <p className="text-sm text-green-700">FDA Approved</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-orange-400">
                            <h5 className="font-semibold text-orange-900 mb-2 flex items-center space-x-2">
                              <AlertCircle className="h-4 w-4" />
                              <span>Important Instructions</span>
                            </h5>
                            <p className="text-sm text-orange-800 leading-relaxed">{med.instructions}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lifestyle Recommendations */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-green-900 flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span>Lifestyle Modifications</span>
                  </h3>
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200">
                    <div className="grid gap-4">
                      {analysisResult.prescription.lifestyle.map((item: string, index: number) => (
                        <div key={index} className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                          <div className="p-1 bg-green-100 rounded-full">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-green-800 leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Follow-up Care */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-blue-900 flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <span>Follow-up Care Plan</span>
                  </h3>
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Next Steps</h4>
                        <p className="text-blue-800 leading-relaxed">{analysisResult.prescription.followUp}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {analysisResult.prescription.warnings.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-red-900 flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <span>Important Safety Warnings</span>
                    </h3>
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-red-200">
                      <div className="grid gap-4">
                        {analysisResult.prescription.warnings.map((warning: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start space-x-4 p-4 bg-red-50 rounded-lg border border-red-200"
                          >
                            <div className="p-1 bg-red-100 rounded-full">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            </div>
                            <span className="text-red-800 leading-relaxed font-medium">{warning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Disclaimer */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 shadow-lg">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-yellow-900 mb-3 text-lg">⚠️ Critical Medical Disclaimer</h4>
                      <div className="space-y-2 text-yellow-800">
                        <p className="font-semibold">
                          This AI-generated treatment plan is for informational and educational purposes only.
                        </p>
                        <ul className="space-y-1 text-sm list-disc list-inside ml-4">
                          <li>Always consult with a qualified healthcare provider before starting any medication</li>
                          <li>
                            Do not use this as a substitute for professional medical advice, diagnosis, or treatment
                          </li>
                          <li>Medication dosages and interactions must be verified by a licensed physician</li>
                          <li>Seek immediate medical attention for any emergency symptoms</li>
                          <li>This AI analysis should complement, not replace, clinical judgment</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
