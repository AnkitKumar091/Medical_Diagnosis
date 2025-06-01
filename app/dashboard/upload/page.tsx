"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileImage, Brain, CheckCircle, AlertCircle, ArrowLeft, Pill, Calendar, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [scanType, setScanType] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

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

  const analyzeImage = async () => {
    if (!selectedFile || !scanType) {
      toast({
        title: "Missing information",
        description: "Please select a file and scan type before analyzing.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setProgress(0)

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
    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)

      // Mock analysis results with AI prescription
      const mockResults = {
        "chest-xray": {
          diagnosis:
            Math.random() > 0.7
              ? "Pneumonia detected in right lower lobe"
              : Math.random() > 0.4
                ? "Mild cardiomegaly observed"
                : "Normal chest X-ray",
          confidence: Math.random() > 0.7 ? 87.3 : Math.random() > 0.4 ? 91.2 : 96.8,
          findings:
            Math.random() > 0.7
              ? [
                  "Consolidation in right lower lobe consistent with pneumonia",
                  "Increased opacity in right lung base",
                  "Heart size within normal limits",
                  "No pleural effusion detected",
                ]
              : Math.random() > 0.4
                ? [
                    "Enlarged cardiac silhouette (cardiothoracic ratio >0.5)",
                    "Clear lung fields bilaterally",
                    "No acute pulmonary infiltrates",
                    "Normal bone structures",
                  ]
                : [
                    "Clear lung fields bilaterally",
                    "Normal heart size and shape",
                    "No acute bone abnormalities",
                    "Normal mediastinal contours",
                  ],
          severity: Math.random() > 0.7 ? "Moderate" : Math.random() > 0.4 ? "Mild" : "Normal",
          recommendations:
            Math.random() > 0.7
              ? [
                  "Antibiotic therapy recommended",
                  "Follow-up chest X-ray in 7-10 days",
                  "Monitor for respiratory symptoms",
                ]
              : Math.random() > 0.4
                ? [
                    "Echocardiogram recommended for cardiac evaluation",
                    "Monitor blood pressure regularly",
                    "Follow up with cardiologist",
                  ]
                : ["Continue routine care", "Follow up as scheduled with your physician"],
          prescription:
            Math.random() > 0.7
              ? {
                  medications: [
                    {
                      name: "Amoxicillin-Clavulanate",
                      dosage: "875mg/125mg",
                      frequency: "Twice daily",
                      duration: "7-10 days",
                      instructions: "Take with food to reduce stomach upset",
                      timing: "Morning and evening with meals",
                    },
                    {
                      name: "Acetaminophen",
                      dosage: "500mg",
                      frequency: "Every 6 hours as needed",
                      duration: "As needed for fever/pain",
                      instructions: "Do not exceed 3000mg in 24 hours",
                      timing: "As needed for symptoms",
                    },
                    {
                      name: "Dextromethorphan",
                      dosage: "15mg",
                      frequency: "Every 4 hours as needed",
                      duration: "For cough relief",
                      instructions: "Take with plenty of water",
                      timing: "As needed for cough",
                    },
                  ],
                  lifestyle: [
                    "Rest and adequate sleep (8+ hours daily)",
                    "Increase fluid intake (8-10 glasses water daily)",
                    "Avoid smoking and alcohol",
                    "Use humidifier if available",
                    "Avoid strenuous activities until recovery",
                  ],
                  followUp: "Return if symptoms worsen or no improvement in 48-72 hours",
                  warnings: [
                    "Complete the full course of antibiotics even if feeling better",
                    "Seek immediate care if breathing becomes difficult",
                    "Monitor temperature and report fever >101.5°F",
                  ],
                }
              : Math.random() > 0.4
                ? {
                    medications: [
                      {
                        name: "Lisinopril",
                        dosage: "10mg",
                        frequency: "Once daily",
                        duration: "Ongoing",
                        instructions: "Take at the same time each day, preferably morning",
                        timing: "Morning with breakfast",
                      },
                      {
                        name: "Metoprolol",
                        dosage: "25mg",
                        frequency: "Twice daily",
                        duration: "Ongoing",
                        instructions: "Take with or immediately after meals",
                        timing: "Morning and evening with meals",
                      },
                    ],
                    lifestyle: [
                      "Low sodium diet (<2300mg daily)",
                      "Regular exercise (30 min, 5 days/week)",
                      "Weight management if overweight",
                      "Limit alcohol consumption",
                      "Monitor blood pressure regularly",
                    ],
                    followUp: "Cardiology consultation within 2-4 weeks",
                    warnings: [
                      "Do not stop medications without consulting physician",
                      "Monitor for dizziness or fatigue",
                      "Check blood pressure regularly",
                    ],
                  }
                : {
                    medications: [],
                    lifestyle: [
                      "Continue healthy lifestyle habits",
                      "Regular exercise and balanced diet",
                      "Annual health screenings",
                      "Avoid smoking",
                    ],
                    followUp: "Routine follow-up as scheduled",
                    warnings: [],
                  },
        },
        "brain-mri": {
          diagnosis:
            Math.random() > 0.8
              ? "Small vessel disease detected"
              : Math.random() > 0.5
                ? "Mild cerebral atrophy"
                : "Normal brain MRI",
          confidence: Math.random() > 0.8 ? 83.7 : Math.random() > 0.5 ? 89.4 : 97.1,
          findings:
            Math.random() > 0.8
              ? [
                  "Multiple small hyperintense lesions in white matter",
                  "Consistent with small vessel ischemic changes",
                  "No acute infarction or hemorrhage",
                  "Ventricular system normal",
                ]
              : Math.random() > 0.5
                ? [
                    "Mild generalized cerebral volume loss",
                    "Enlarged ventricles and sulci",
                    "No focal lesions identified",
                    "Normal signal intensity in brain parenchyma",
                  ]
                : [
                    "No acute intracranial abnormalities",
                    "Normal brain parenchyma signal",
                    "No evidence of mass lesions or hemorrhage",
                    "Normal ventricular system",
                  ],
          severity: Math.random() > 0.8 ? "Mild" : Math.random() > 0.5 ? "Mild" : "Normal",
          recommendations:
            Math.random() > 0.8
              ? ["Control cardiovascular risk factors", "Regular monitoring recommended", "Discuss with neurologist"]
              : Math.random() > 0.5
                ? [
                    "Age-related changes, monitor progression",
                    "Cognitive assessment if symptoms present",
                    "Annual follow-up MRI",
                  ]
                : ["No immediate intervention required", "Routine follow-up as clinically indicated"],
          prescription:
            Math.random() > 0.8
              ? {
                  medications: [
                    {
                      name: "Aspirin",
                      dosage: "81mg",
                      frequency: "Once daily",
                      duration: "Ongoing",
                      instructions: "Take with food to prevent stomach irritation",
                      timing: "Morning with breakfast",
                    },
                    {
                      name: "Atorvastatin",
                      dosage: "20mg",
                      frequency: "Once daily at bedtime",
                      duration: "Ongoing",
                      instructions: "Avoid grapefruit juice",
                      timing: "Bedtime",
                    },
                  ],
                  lifestyle: [
                    "Mediterranean diet rich in omega-3 fatty acids",
                    "Regular cardiovascular exercise",
                    "Blood pressure monitoring",
                    "Smoking cessation if applicable",
                    "Cognitive exercises and mental stimulation",
                  ],
                  followUp: "Neurology consultation within 4-6 weeks",
                  warnings: [
                    "Report any new neurological symptoms immediately",
                    "Monitor for muscle pain with statin therapy",
                    "Regular liver function tests",
                  ],
                }
              : Math.random() > 0.5
                ? {
                    medications: [
                      {
                        name: "Vitamin B12",
                        dosage: "1000mcg",
                        frequency: "Once daily",
                        duration: "3 months",
                        instructions: "Take with breakfast",
                        timing: "Morning with food",
                      },
                      {
                        name: "Vitamin D3",
                        dosage: "2000 IU",
                        frequency: "Once daily",
                        duration: "Ongoing",
                        instructions: "Take with a meal containing fat",
                        timing: "With lunch or dinner",
                      },
                    ],
                    lifestyle: [
                      "Cognitive exercises and mental stimulation",
                      "Social engagement activities",
                      "Regular sleep schedule (7-9 hours)",
                      "Stress management techniques",
                      "Regular physical exercise",
                    ],
                    followUp: "Annual MRI and cognitive assessment",
                    warnings: ["Report any memory changes or confusion", "Maintain regular sleep patterns"],
                  }
                : {
                    medications: [],
                    lifestyle: [
                      "Maintain healthy brain habits",
                      "Regular mental and physical exercise",
                      "Balanced nutrition",
                      "Adequate sleep",
                    ],
                    followUp: "Routine follow-up as scheduled",
                    warnings: [],
                  },
        },
        "ct-scan": {
          diagnosis:
            Math.random() > 0.75
              ? "Hepatic steatosis (fatty liver)"
              : Math.random() > 0.4
                ? "Renal cyst detected"
                : "Normal abdominal CT scan",
          confidence: Math.random() > 0.75 ? 92.6 : Math.random() > 0.4 ? 95.8 : 94.3,
          findings:
            Math.random() > 0.75
              ? [
                  "Diffuse low attenuation of liver parenchyma",
                  "Liver-to-spleen attenuation ratio <1.0",
                  "No focal hepatic lesions",
                  "Normal pancreas, spleen, and kidneys",
                ]
              : Math.random() > 0.4
                ? [
                    "Simple cyst in left kidney measuring 2.3 cm",
                    "Normal liver, pancreas, and spleen",
                    "No abdominal lymphadenopathy",
                    "Normal bowel gas pattern",
                  ]
                : [
                    "Normal enhancement of all organs",
                    "No focal lesions or masses detected",
                    "Normal bowel wall thickness",
                    "No free fluid or lymphadenopathy",
                  ],
          severity: Math.random() > 0.75 ? "Mild" : Math.random() > 0.4 ? "Benign" : "Normal",
          recommendations:
            Math.random() > 0.75
              ? [
                  "Lifestyle modifications recommended",
                  "Weight loss and dietary changes",
                  "Monitor liver function tests",
                ]
              : Math.random() > 0.4
                ? [
                    "Benign finding, no treatment needed",
                    "Routine follow-up in 1-2 years",
                    "No restrictions on activity",
                  ]
                : ["Results within normal limits", "Continue routine preventive care"],
          prescription:
            Math.random() > 0.75
              ? {
                  medications: [
                    {
                      name: "Vitamin E",
                      dosage: "800 IU",
                      frequency: "Once daily",
                      duration: "6 months",
                      instructions: "Take with a meal containing fat for better absorption",
                      timing: "With dinner",
                    },
                    {
                      name: "Omega-3 Fatty Acids",
                      dosage: "1000mg",
                      frequency: "Twice daily",
                      duration: "Ongoing",
                      instructions: "Take with meals to reduce fishy aftertaste",
                      timing: "With breakfast and dinner",
                    },
                  ],
                  lifestyle: [
                    "Weight reduction of 5-10% if overweight",
                    "Low-fat, low-carbohydrate diet",
                    "Limit alcohol consumption",
                    "Regular aerobic exercise (150 min/week)",
                    "Avoid high-fructose corn syrup",
                  ],
                  followUp: "Liver function tests in 3 months, repeat CT in 6 months",
                  warnings: ["Avoid alcohol completely", "Monitor for abdominal pain", "Regular weight monitoring"],
                }
              : Math.random() > 0.4
                ? {
                    medications: [],
                    lifestyle: [
                      "No dietary restrictions",
                      "Continue normal activities",
                      "Stay well hydrated",
                      "Regular exercise",
                    ],
                    followUp: "Routine imaging in 1-2 years if asymptomatic",
                    warnings: [],
                  }
                : {
                    medications: [],
                    lifestyle: [
                      "Maintain healthy diet and exercise",
                      "Regular preventive care",
                      "Annual health screenings",
                    ],
                    followUp: "Routine follow-up as scheduled",
                    warnings: [],
                  },
        },
        "bone-xray": {
          diagnosis:
            Math.random() > 0.6
              ? "Osteoarthritis changes detected"
              : Math.random() > 0.3
                ? "Hairline fracture identified"
                : "Normal bone X-ray",
          confidence: Math.random() > 0.6 ? 88.9 : Math.random() > 0.3 ? 94.7 : 96.2,
          findings:
            Math.random() > 0.6
              ? [
                  "Joint space narrowing in affected areas",
                  "Osteophyte formation present",
                  "Subchondral sclerosis noted",
                  "No acute fractures detected",
                ]
              : Math.random() > 0.3
                ? [
                    "Subtle lucent line consistent with hairline fracture",
                    "No displacement of bone fragments",
                    "Soft tissue swelling present",
                    "Normal bone density",
                  ]
                : [
                    "Normal bone density and alignment",
                    "No fractures or dislocations",
                    "Joint spaces well preserved",
                    "Normal soft tissue shadows",
                  ],
          severity: Math.random() > 0.6 ? "Mild to Moderate" : Math.random() > 0.3 ? "Mild" : "Normal",
          recommendations:
            Math.random() > 0.6
              ? [
                  "Physical therapy may be beneficial",
                  "Anti-inflammatory medications as needed",
                  "Weight management if applicable",
                ]
              : Math.random() > 0.3
                ? ["Immobilization recommended", "Follow-up X-ray in 2-3 weeks", "Avoid weight-bearing activities"]
                : ["No treatment required", "Continue normal activities"],
          prescription:
            Math.random() > 0.6
              ? {
                  medications: [
                    {
                      name: "Ibuprofen",
                      dosage: "400mg",
                      frequency: "Three times daily with meals",
                      duration: "2-3 weeks",
                      instructions: "Take with food to prevent stomach upset",
                      timing: "With breakfast, lunch, and dinner",
                    },
                    {
                      name: "Glucosamine Sulfate",
                      dosage: "1500mg",
                      frequency: "Once daily",
                      duration: "3-6 months",
                      instructions: "Take with meals for better absorption",
                      timing: "With breakfast",
                    },
                    {
                      name: "Topical Diclofenac Gel",
                      dosage: "Apply thin layer",
                      frequency: "3-4 times daily",
                      duration: "As needed",
                      instructions: "Apply to affected joint, wash hands after use",
                      timing: "Morning, afternoon, evening, and bedtime",
                    },
                  ],
                  lifestyle: [
                    "Low-impact exercises (swimming, cycling)",
                    "Weight management to reduce joint stress",
                    "Hot/cold therapy for pain relief",
                    "Ergonomic modifications at work/home",
                    "Avoid high-impact activities",
                  ],
                  followUp: "Orthopedic consultation if symptoms persist beyond 6 weeks",
                  warnings: [
                    "Stop NSAIDs if stomach upset occurs",
                    "Monitor for swelling or increased pain",
                    "Avoid overuse of affected joint",
                  ],
                }
              : Math.random() > 0.3
                ? {
                    medications: [
                      {
                        name: "Acetaminophen",
                        dosage: "500mg",
                        frequency: "Every 6 hours as needed",
                        duration: "2-3 weeks",
                        instructions: "Do not exceed 3000mg in 24 hours",
                        timing: "As needed for pain",
                      },
                      {
                        name: "Calcium Carbonate",
                        dosage: "500mg",
                        frequency: "Twice daily with meals",
                        duration: "6-8 weeks",
                        instructions: "Take with vitamin D for better absorption",
                        timing: "With breakfast and dinner",
                      },
                    ],
                    lifestyle: [
                      "Immobilize affected area",
                      "Ice application 15-20 minutes every 2-3 hours",
                      "Elevate injured limb when possible",
                      "Avoid weight-bearing activities",
                      "Gentle range of motion exercises after initial healing",
                    ],
                    followUp: "Follow-up X-ray in 2-3 weeks to assess healing",
                    warnings: [
                      "Seek immediate care if numbness or tingling occurs",
                      "Report increased pain or swelling",
                      "Do not remove immobilization without medical approval",
                    ],
                  }
                : {
                    medications: [],
                    lifestyle: [
                      "Continue regular exercise",
                      "Maintain adequate calcium and vitamin D intake",
                      "Weight-bearing exercises for bone health",
                    ],
                    followUp: "Routine follow-up as scheduled",
                    warnings: [],
                  },
        },
        ultrasound: {
          diagnosis:
            Math.random() > 0.7
              ? "Gallbladder polyp detected"
              : Math.random() > 0.4
                ? "Thyroid nodule identified"
                : "Normal ultrasound findings",
          confidence: Math.random() > 0.7 ? 86.4 : Math.random() > 0.4 ? 91.8 : 95.5,
          findings:
            Math.random() > 0.7
              ? [
                  "Small echogenic focus in gallbladder wall",
                  "Measures approximately 4mm",
                  "No gallstones or wall thickening",
                  "Normal bile duct caliber",
                ]
              : Math.random() > 0.4
                ? [
                    "Hypoechoic nodule in thyroid gland",
                    "Well-defined margins, measures 8mm",
                    "Normal thyroid parenchyma elsewhere",
                    "No cervical lymphadenopathy",
                  ]
                : [
                    "Normal organ echogenicity and size",
                    "No masses or cysts detected",
                    "Normal vascular flow patterns",
                    "No fluid collections",
                  ],
          severity: Math.random() > 0.7 ? "Benign" : Math.random() > 0.4 ? "Indeterminate" : "Normal",
          recommendations:
            Math.random() > 0.7
              ? ["Annual ultrasound surveillance", "No immediate intervention needed", "Maintain healthy diet"]
              : Math.random() > 0.4
                ? [
                    "Fine needle aspiration may be considered",
                    "Thyroid function tests recommended",
                    "Follow-up in 6 months",
                  ]
                : ["Continue routine screening", "No follow-up required"],
          prescription:
            Math.random() > 0.7
              ? {
                  medications: [],
                  lifestyle: [
                    "Low-fat diet to reduce gallbladder stress",
                    "Maintain healthy weight",
                    "Avoid rapid weight loss",
                    "Increase fiber intake",
                    "Regular meal timing",
                  ],
                  followUp: "Annual ultrasound surveillance",
                  warnings: ["Report severe abdominal pain immediately", "Avoid very fatty meals"],
                }
              : Math.random() > 0.4
                ? {
                    medications: [
                      {
                        name: "Levothyroxine",
                        dosage: "25mcg",
                        frequency: "Once daily on empty stomach",
                        duration: "As determined by TSH levels",
                        instructions:
                          "Take 30-60 minutes before breakfast, avoid calcium/iron supplements within 4 hours",
                        timing: "Early morning on empty stomach",
                      },
                    ],
                    lifestyle: [
                      "Regular thyroid function monitoring",
                      "Iodine-rich foods in moderation",
                      "Stress management techniques",
                      "Regular sleep schedule",
                      "Avoid excessive soy products",
                    ],
                    followUp: "Endocrinology consultation and thyroid function tests in 6-8 weeks",
                    warnings: [
                      "Report heart palpitations or chest pain",
                      "Monitor for changes in energy levels",
                      "Take medication consistently at same time daily",
                    ],
                  }
                : {
                    medications: [],
                    lifestyle: ["Continue healthy lifestyle", "Regular preventive screenings", "Balanced nutrition"],
                    followUp: "Routine follow-up as scheduled",
                    warnings: [],
                  },
        },
        mammography: {
          diagnosis:
            Math.random() > 0.8
              ? "BI-RADS 3: Probably benign finding"
              : Math.random() > 0.5
                ? "Dense breast tissue noted"
                : "BI-RADS 1: Negative mammogram",
          confidence: Math.random() > 0.8 ? 84.2 : Math.random() > 0.5 ? 93.7 : 97.9,
          findings:
            Math.random() > 0.8
              ? [
                  "Small circumscribed mass in upper outer quadrant",
                  "Stable compared to prior imaging",
                  "No suspicious calcifications",
                  "Normal lymph nodes",
                ]
              : Math.random() > 0.5
                ? [
                    "Heterogeneously dense breast tissue",
                    "May obscure small lesions",
                    "No dominant masses or calcifications",
                    "Symmetric breast tissue",
                  ]
                : [
                    "No masses, calcifications, or distortion",
                    "Normal breast parenchyma",
                    "No skin thickening or retraction",
                    "Negative for malignancy",
                  ],
          severity: Math.random() > 0.8 ? "Low suspicion" : Math.random() > 0.5 ? "Normal variant" : "Normal",
          recommendations:
            Math.random() > 0.8
              ? ["Short-term follow-up in 6 months", "Consider breast MRI if high risk", "Continue annual screening"]
              : Math.random() > 0.5
                ? [
                    "Consider supplemental screening (ultrasound/MRI)",
                    "Annual mammography recommended",
                    "Discuss with radiologist",
                  ]
                : ["Continue annual screening mammography", "Routine breast self-examination"],
          prescription:
            Math.random() > 0.8
              ? {
                  medications: [
                    {
                      name: "Vitamin D3",
                      dosage: "2000 IU",
                      frequency: "Once daily",
                      duration: "Ongoing",
                      instructions: "Take with a meal containing fat",
                      timing: "With lunch or dinner",
                    },
                  ],
                  lifestyle: [
                    "Regular breast self-examination",
                    "Maintain healthy weight",
                    "Limit alcohol consumption",
                    "Regular exercise (150 min/week)",
                    "Consider genetic counseling if family history",
                  ],
                  followUp: "Follow-up mammography in 6 months",
                  warnings: [
                    "Report any new breast lumps or changes",
                    "Perform monthly self-examinations",
                    "Maintain regular screening schedule",
                  ],
                }
              : Math.random() > 0.5
                ? {
                    medications: [],
                    lifestyle: [
                      "Monthly breast self-examination",
                      "Annual clinical breast examination",
                      "Discuss supplemental screening options",
                      "Maintain healthy lifestyle",
                      "Regular exercise and balanced diet",
                    ],
                    followUp: "Annual mammography with possible supplemental screening",
                    warnings: ["Report any breast changes immediately", "Dense tissue may require additional imaging"],
                  }
                : {
                    medications: [],
                    lifestyle: [
                      "Continue monthly breast self-examination",
                      "Maintain healthy diet and exercise",
                      "Annual mammography screening",
                      "Limit alcohol consumption",
                    ],
                    followUp: "Annual mammography screening",
                    warnings: [],
                  },
        },
      }

      const result = mockResults[scanType as keyof typeof mockResults] || mockResults["chest-xray"]
      setAnalysisResult(result)
      setIsAnalyzing(false)

      toast({
        title: "Analysis complete!",
        description: "Your medical image has been successfully analyzed with AI prescription generated.",
      })
    }, analysisTime)
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
              <Brain className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Upload Medical Image</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Select Medical Image</CardTitle>
              <CardDescription>Drag and drop your medical image or click to browse</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {selectedFile ? selectedFile.name : "Drop your medical image here"}
                  </p>
                  <p className="text-sm text-gray-500">Supports JPEG, PNG, WebP, DICOM • Max size 50MB</p>
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
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <FileImage className="h-6 w-6 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="scan-type">Scan Type</Label>
                <Select value={scanType} onValueChange={setScanType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the type of medical scan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chest-xray">Chest X-Ray</SelectItem>
                    <SelectItem value="brain-mri">Brain MRI</SelectItem>
                    <SelectItem value="ct-scan">CT Scan</SelectItem>
                    <SelectItem value="bone-xray">Bone X-Ray</SelectItem>
                    <SelectItem value="ultrasound">Ultrasound</SelectItem>
                    <SelectItem value="mammography">Mammography</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={analyzeImage} disabled={!selectedFile || !scanType || isAnalyzing} className="w-full">
                {isAnalyzing ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze with AI
                  </>
                )}
              </Button>

              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI Analysis Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-gray-600 text-center">YOLOv8 model is analyzing your medical image...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis Results</CardTitle>
              <CardDescription>Detailed analysis from our advanced YOLOv8 medical AI model</CardDescription>
            </CardHeader>
            <CardContent>
              {!analysisResult ? (
                <div className="text-center py-12 text-gray-500">
                  <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Upload and analyze an image to see results here</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Diagnosis */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">Diagnosis</h3>
                    </div>
                    <p className="text-blue-800">{analysisResult.diagnosis}</p>
                    <p className="text-sm text-blue-600 mt-1">Confidence: {analysisResult.confidence}%</p>
                  </div>

                  {/* Findings */}
                  <div>
                    <h3 className="font-semibold mb-3">Key Findings</h3>
                    <ul className="space-y-2">
                      {analysisResult.findings.map((finding: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Severity */}
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Severity: </span>
                      <span className="text-green-700">{analysisResult.severity}</span>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="font-semibold mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((recommendation: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Prescription Section */}
        {analysisResult && analysisResult.prescription && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Pill className="h-6 w-6 text-purple-600" />
                  <span>AI-Generated Prescription</span>
                </CardTitle>
                <CardDescription>
                  Personalized treatment plan based on AI analysis. Always consult with your healthcare provider.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Medications */}
                {analysisResult.prescription.medications.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Pill className="h-5 w-5 text-purple-600" />
                      <span>Medications</span>
                    </h3>
                    <div className="grid gap-4">
                      {analysisResult.prescription.medications.map((med: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 bg-purple-50">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-lg text-purple-900">{med.name}</h4>
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                              {med.dosage}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-purple-600" />
                              <span>
                                <strong>Frequency:</strong> {med.frequency}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-purple-600" />
                              <span>
                                <strong>Duration:</strong> {med.duration}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-purple-600" />
                              <span>
                                <strong>Timing:</strong> {med.timing}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-white rounded border-l-4 border-purple-400">
                            <p className="text-sm text-gray-700">
                              <strong>Instructions:</strong> {med.instructions}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lifestyle Recommendations */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Lifestyle Modifications</span>
                  </h3>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <ul className="space-y-3">
                      {analysisResult.prescription.lifestyle.map((item: string, index: number) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-green-800">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Follow-up Care */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span>Follow-up Care</span>
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-blue-800">{analysisResult.prescription.followUp}</p>
                  </div>
                </div>

                {/* Warnings */}
                {analysisResult.prescription.warnings.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span>Important Warnings</span>
                    </h3>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <ul className="space-y-2">
                        {analysisResult.prescription.warnings.map((warning: string, index: number) => (
                          <li key={index} className="flex items-start space-x-3">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-red-800">{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Important Medical Disclaimer</p>
                      <p>
                        This AI-generated prescription is for informational purposes only and should not replace
                        professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare
                        provider before starting, stopping, or changing any medication or treatment plan.
                      </p>
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
