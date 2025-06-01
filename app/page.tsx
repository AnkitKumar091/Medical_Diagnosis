import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Shield, Zap, Users, FileImage, Activity } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">MediScan AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/about">
              <Button variant="ghost">About</Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost">Contact</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">AI-Powered Medical Image Analysis</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Upload X-rays, MRI scans, CT scans, and more to get instant AI-powered diagnosis and analysis using advanced
          YOLOv8 technology. Trusted by healthcare professionals worldwide.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/auth/signup">
            <Button size="lg" className="px-8">
              Start Analysis
            </Button>
          </Link>
          <Link href="/about">
            <Button size="lg" variant="outline" className="px-8">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-blue-600 text-white rounded-xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Scans Analyzed</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">95.7%</div>
              <div className="text-blue-100">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Doctors Trust Us</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose MediScan AI?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card>
            <CardHeader>
              <Brain className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Advanced AI</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Powered by YOLOv8 deep learning models for accurate medical image analysis
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Instant Results</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Get diagnosis and analysis results in seconds, not hours or days</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your medical data is encrypted and processed securely with healthcare compliance
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Patient-Centered</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Designed with patients and healthcare providers in mind</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gray-50 rounded-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileImage className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Upload Medical Image</h3>
              <p className="text-gray-600">Upload your X-ray, MRI, CT scan or other medical images securely</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. AI Analysis</h3>
              <p className="text-gray-600">Our YOLOv8 model analyzes the image with high accuracy</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Get Results</h3>
              <p className="text-gray-600">Receive detailed analysis and findings instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Trusted by Healthcare Professionals</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">DR</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold">Dr. Sarah Johnson</h4>
                  <p className="text-sm text-gray-600">Senior Radiologist</p>
                </div>
              </div>
              <p className="text-gray-600">
                "MediScan AI has revolutionized our workflow. The accuracy of diagnoses and speed of analysis has helped
                us serve more patients efficiently."
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">PM</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold">Dr. Michael Chen</h4>
                  <p className="text-sm text-gray-600">Chief of Radiology</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The AI analysis is remarkably accurate and saves us valuable time. A game-changer for modern
                healthcare."
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-lg">AK</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold">Dr. Emily Rodriguez</h4>
                  <p className="text-sm text-gray-600">Emergency Medicine</p>
                </div>
              </div>
              <p className="text-gray-600">
                "MediScan AI's analysis has been invaluable for preliminary screenings. The system catches subtle
                findings that might be missed."
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-blue-600 text-white rounded-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience AI-Powered Medical Analysis?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare providers who trust MediScan AI for accurate, fast, and secure medical image
            analysis.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="px-8">
                Get Started Today
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="px-8 bg-transparent text-white border-white hover:bg-white hover:text-blue-600"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-6 w-6" />
                <span className="text-xl font-bold">MediScan AI</span>
              </div>
              <p className="text-gray-400">Advanced AI-powered medical image analysis for healthcare providers.</p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signin" className="text-gray-400 hover:text-white">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="text-gray-400 hover:text-white">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>MediScan AI Technologies</li>
                <li>123 Healthcare Avenue</li>
                <li>Medical District</li>
                <li>City, State 12345</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Phone: +1 (555) 123-4567</li>
                <li>Email: support@mediscan-ai.com</li>
                <li>Hours: 9:00 AM - 6:00 PM</li>
                <li>Monday - Friday</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 MediScan AI. All rights reserved. Not a substitute for professional medical advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
