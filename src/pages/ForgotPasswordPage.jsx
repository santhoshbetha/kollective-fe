import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  Mail,
  Sparkles,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // TODO: Implement actual password reset logic
      console.log("Password reset request for:", email)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setIsSuccess(true)
    } catch (err) {
      setError("Failed to send password reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate("/login")
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Check Your Email
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">Password reset instructions sent</p>
          </div>

          {/* Success Content */}
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold mb-4">Email Sent!</h2>
                <p className="text-muted-foreground mb-6">
                  We've sent password reset instructions to <strong className="text-foreground font-semibold">{email}</strong>.
                  Please check your email and follow the link to reset your password.
                </p>

                <div className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleBackToLogin}
                    className="w-full bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 h-12"
                  >
                    <div className="flex items-center gap-2">
                      Back to Sign In
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Button>

                  <button
                    onClick={() => setIsSuccess(false)}
                    className="w-full text-primary hover:underline font-medium text-sm"
                  >
                    Try a different email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Your information is secure and will never be shared</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Reset Your Password
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">We'll send you reset instructions</p>
        </div>

        {/* Main Content */}
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-8">
            <div className="text-center mb-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" hidden/>
              <img src="/K99.png" alt="Kollective99 Logo" className="h-14 w-16 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Forgot Your Password?</h2>
              <p className="text-muted-foreground text-sm">
                No worries! Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">We'll send a reset link to this email</p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 h-12"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending Reset Link...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Send Reset Link
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <button
                onClick={handleBackToLogin}
                className="text-primary hover:underline font-medium text-sm"
              >
                ← Back to Sign In
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up instead
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 space-y-2">
        <p className="text-sm text-muted-foreground">
          By resetting your password, you agree to our{" "}
          <Link to="/terms" className="hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Your information is secure and will never be shared</span>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage