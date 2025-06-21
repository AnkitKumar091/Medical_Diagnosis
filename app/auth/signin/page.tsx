"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Eye, EyeOff, Mail, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { authService } from "@/lib/auth"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showResendConfirmation, setShowResendConfirmation] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setShowResendConfirmation(false)

    try {
      const result = await authService.signIn(email, password)

      if (result.success && result.user) {
        toast({
          title: "Welcome back!",
          description: `You have successfully signed in as ${result.user.name}.`,
        })

        // Add a small delay to ensure data is stored properly
        setTimeout(() => {
          router.push("/dashboard")
        }, 500)
      } else {
        // Check if it's an email confirmation error
        if (result.error?.includes("confirmation")) {
          setShowResendConfirmation(true)
        }

        toast({
          title: "Sign in failed",
          description: result.error || "Please check your credentials and try again.",
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
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await authService.resendConfirmation(email)
      if (result.success) {
        toast({
          title: "Email sent!",
          description: "We've sent a new confirmation email. Please check your inbox and spam folder.",
        })
        setShowResendConfirmation(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">MediScan AI</span>
          </div>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignIn}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {showResendConfirmation && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm text-yellow-800 font-medium">Email not confirmed</p>
                    <p className="text-sm text-yellow-700">
                      Please check your email and click the confirmation link. If you didn't receive it, we can send a
                      new one.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendConfirmation}
                      disabled={isLoading}
                      className="mt-2"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {isLoading ? "Sending..." : "Resend Confirmation"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
            <div className="text-center text-sm">
              {"Don't have an account? "}
              <Link href="/auth/signup" className="text-blue-600 hover:underline">
                Sign up
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
