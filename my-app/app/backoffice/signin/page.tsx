'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { createClient } from '../../lib/supabase'
import Ferrofluid from '../../components/Ferrofluid/Ferrofluid'

export default function SignIn() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({})
  const router = useRouter()

  const validateForm = useCallback(() => {
    const newErrors: typeof errors = {}

    if (!username.trim()) {
      newErrors.username = 'Username is required'
    } else if (username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [username, password])

  const handleSignIn = useCallback(async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const email = `${username.trim()}@example.com`
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.session) {
        await Swal.fire({
          title: 'Success',
          text: 'Sign in successful!',
          icon: 'success',
          timer: 1500
        })
        router.push('/backoffice/home/todo')
      }
    } catch (err: any) {
      if (err.message.includes('Invalid login credentials')) {
        Swal.fire({
          title: 'Sign In Failed',
          text: 'Invalid username or password',
          icon: 'warning',
          timer: 2000
        })
      } else {
        Swal.fire({
          title: 'Error',
          text: err.message || 'An unexpected error occurred',
          icon: 'error'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [username, password, validateForm, router])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isLoading) {
        handleSignIn()
      }
    },
    [handleSignIn, isLoading]
  )

  const goToSignUp = useCallback(() => {
    router.push('/backoffice/signup')
  }, [router])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Animated background - Fixed and behind content */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <Ferrofluid
          colors={["#ffffff", "#ffffff", "#ffffff"]}
          speed={0.5}
          scale={1}
          turbulence={1}
          fluidity={0.1}
          rimWidth={0.2}
          sharpness={3}
          shimmer={1}
          glow={2}
          flowDirection="down"
          opacity={1}
          mouseInteraction={true}
          mouseStrength={1}
          mouseRadius={0.3}
        />
      </div>

      <div className="w-full max-w-md px-4 sm:px-6 md:px-8 relative z-10">
        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">Welcome Back</h1>
            <p className="text-white/80 text-xs sm:text-sm">Sign in to continue your journey</p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSignIn()
            }}
            className="space-y-4 sm:space-y-5"
          >
            {/* Username Input */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-white text-xs sm:text-sm font-medium block">
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (errors.username) setErrors({ ...errors, username: undefined })
                  }}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className={`w-full px-4 py-2.5 sm:py-3 bg-white/20 backdrop-blur-md border rounded-lg sm:rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${
                    errors.username ? 'border-red-400 focus:ring-red-400' : 'border-white/30 focus:ring-white/50'
                  }`}
                  placeholder="Enter your username"
                  aria-label="Username"
                  aria-invalid={!!errors.username}
                />
                {errors.username && (
                  <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
                    <i className="fa fa-exclamation-circle flex-shrink-0"></i>
                    <span>{errors.username}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-white text-xs sm:text-sm font-medium block">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors({ ...errors, password: undefined })
                  }}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className={`w-full px-4 py-2.5 sm:py-3 pr-12 bg-white/20 backdrop-blur-md border rounded-lg sm:rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${
                    errors.password ? 'border-red-400 focus:ring-red-400' : 'border-white/30 focus:ring-white/50'
                  }`}
                  placeholder="Enter your password"
                  aria-label="Password"
                  aria-invalid={!!errors.password}
                />
                {/* Password Visibility Toggle */}
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50 rounded p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm sm:text-base`}></i>
                </button>
                {errors.password && (
                  <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
                    <i className="fa fa-exclamation-circle flex-shrink-0"></i>
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 bg-white/30 backdrop-blur-md border border-white/40 rounded-lg sm:rounded-xl text-white font-semibold hover:bg-white/40 hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fa fa-spinner fa-spin"></i>
                  <span className="hidden sm:inline">Signing in...</span>
                  <span className="sm:hidden">Signing...</span>
                </>
              ) : (
                <>
                  <i className="fa fa-check"></i>
                  <span>Sign In Now</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-3 sm:py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30"></div>
            </div>
            <div className="relative bg-white/10 px-4 backdrop-blur-sm rounded-full">
              <span className="text-white/70 text-xs sm:text-sm">or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center space-y-3">
            <p className="text-white/80 text-xs sm:text-sm">Don't have an account?</p>
            <button
              onClick={goToSignUp}
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md border border-white/30 rounded-lg sm:rounded-xl text-white font-semibold hover:from-white/30 hover:to-white/20 hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
              aria-label="Create new account"
            >
              <i className="fa fa-user-plus"></i>
              <span>Create New Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}