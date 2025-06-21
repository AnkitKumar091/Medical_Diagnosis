"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Brain, Eye, EyeOff, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { authService } from "@/lib/auth"

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const result = await authService.signUp({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      })

      if (result.success) {
        if (result.needsConfirmation) {
          // Email confirmation required
          setUserEmail(formData.email)
          setNeedsConfirmation(true)
          toast({
            title: "Check your email!",
            description: "We've sent you a confirmation link. Please check your email to complete registration.",
          })
        } else if (result.user) {
          // User can sign in immediately
          toast({
            title: "Account created!",
            description: `Welcome to MediScan AI, ${result.user.name}! You can now start analyzing medical images.`,
          })
          setTimeout(() => {
            router.push("/dashboard")
          }, 500)
        }
      } else {
        toast({
          title: "Registration failed",
          description: result.error || "Failed to create account. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    setIsLoading(true)
    try {
      const result = await authService.resendConfirmation(userEmail)
      if (result.success) {
        toast({
          title: "Email sent!",
          description: "We've sent another confirmation email. Please check your inbox and spam folder.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to resend confirmation email.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend confirmation email.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (needsConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-green-900">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a confirmation link to <strong>{userEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-green-800 font-medium">Next Steps:</p>
                  <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside ml-2">
                    <li>Check your email inbox</li>
                    <li>Look for an email from MediScan AI</li>
                    <li>Click the confirmation link</li>
                    <li>Return here to sign in</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Don't see the email? Check your spam folder or request a new one.
              </p>
              <Button variant="outline" onClick={handleResendConfirmation} disabled={isLoading} className="w-full">
                {isLoading ? "Sending..." : "Resend Confirmation Email"}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              <Link href="/auth/signin" className="text-blue-600 hover:underline">
                Already confirmed? Sign in
              </Link>
            </div>
            <Link href="/" className="text-center text-sm text-gray-600 hover:underline">
              Back to Home
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">MediScan AI</span>
          </div>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Join thousands of users using AI for medical insights</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleChange("agreeToTerms", checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
            <div className="text-center text-sm">
              {"Already have an account? "}
              <Link href="/auth/signin" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
            <Link href="/" className="text-center text-sm text-gray-600 hover:underline">
              Back to Home
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
