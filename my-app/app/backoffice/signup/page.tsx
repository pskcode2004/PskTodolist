'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { createClient } from '../../lib/supabase'
import { isPasswordPwned } from '../../lib/pwned'
import Ferrofluid from '../../components/Ferrofluid/Ferrofluid'

export default function SignUp() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; username?: string; password?: string; confirmPassword?: string }>({})
  const router = useRouter()

  const validateForm = useCallback(() => {
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = 'Full name is required'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters'
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required'
    } else if (username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) {
      newErrors.password = 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [name, username, password, confirmPassword])

  const handleSignUp = useCallback(async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const isPwned = await isPasswordPwned(password)
      if (isPwned) {
        setErrors(prev => ({ ...prev, password: 'รหัสผ่านนี้เคยหลุดสู่สาธารณะแล้ว กรุณาใช้รหัสผ่านอื่น' }))
        setIsLoading(false)
        return
      }

      const supabase = createClient()
      const email = `${username.trim()}@example.com`
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim(),
            username: username.trim()
          }
        }
      })

      if (error) throw error

      if (data.user) {
        // Insert into public.members table
        const { error: insertError } = await supabase.from('members').insert({
          id: data.user.id,
          name: name.trim(),
          username: username.trim()
        })
        if (insertError) throw insertError
        await Swal.fire({
          title: 'Success!',
          text: 'Account created successfully. Please sign in with your credentials.',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true
        })
        router.push('/backoffice/signin')
      }
    } catch (err: any) {
      if (err.message.includes('already registered')) {
        Swal.fire({
          title: 'Account Exists',
          text: 'Username already taken. Please choose another.',
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
  }, [name, username, password, confirmPassword, validateForm, router])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isLoading) {
        handleSignUp()
      }
    },
    [handleSignUp, isLoading]
  )

  const goToSignIn = useCallback(() => {
    router.push('/backoffice/signin')
  }, [router])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev)
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
            <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">Create Account</h1>
            <p className="text-white/80 text-xs sm:text-sm">Join us and start your journey</p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSignUp()
            }}
            className="space-y-4 sm:space-y-5"
          >
            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-white text-xs sm:text-sm font-medium block">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) setErrors({ ...errors, name: undefined })
                  }}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className={`w-full px-4 py-2.5 sm:py-3 bg-white/20 backdrop-blur-md border rounded-lg sm:rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${
                    errors.name ? 'border-red-400 focus:ring-red-400' : 'border-white/30 focus:ring-white/50'
                  }`}
                  placeholder="Enter your full name"
                  aria-label="Full Name"
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
                    <i className="fa fa-exclamation-circle flex-shrink-0"></i>
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>
            </div>

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
                  placeholder="Choose a username"
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
                  placeholder="Create a password"
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

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-white text-xs sm:text-sm font-medium block">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined })
                  }}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className={`w-full px-4 py-2.5 sm:py-3 pr-12 bg-white/20 backdrop-blur-md border rounded-lg sm:rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${
                    errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : 'border-white/30 focus:ring-white/50'
                  }`}
                  placeholder="Confirm your password"
                  aria-label="Confirm Password"
                  aria-invalid={!!errors.confirmPassword}
                />
                {/* Confirm Password Visibility Toggle */}
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50 rounded p-1"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  aria-pressed={showConfirmPassword}
                >
                  <i className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm sm:text-base`}></i>
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
                    <i className="fa fa-exclamation-circle flex-shrink-0"></i>
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 bg-white/30 backdrop-blur-md border border-white/40 rounded-lg sm:rounded-xl text-white font-semibold hover:bg-white/40 hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fa fa-spinner fa-spin"></i>
                  <span className="hidden sm:inline">Creating account...</span>
                  <span className="sm:hidden">Creating...</span>
                </>
              ) : (
                <>
                  <i className="fa fa-check"></i>
                  <span>Create Account</span>
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

          {/* Sign In Link */}
          <div className="text-center space-y-3">
            <p className="text-white/80 text-xs sm:text-sm">Already have an account?</p>
            <button
              onClick={goToSignIn}
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md border border-white/30 rounded-lg sm:rounded-xl text-white font-semibold hover:from-white/30 hover:to-white/20 hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
              aria-label="Sign in to existing account"
            >
              <i className="fa fa-sign-in"></i>
              <span>Sign In Instead</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}