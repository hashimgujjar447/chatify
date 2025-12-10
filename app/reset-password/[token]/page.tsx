"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { Lock, Eye, EyeOff, MessageCircle, Check } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }
    
    try {
      const response = await fetch(`/api/auth/resetPassword/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmPassword }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(data.message || data.error || 'Failed to reset password. The link may have expired.')
      }
    } catch (error: any) {
      console.error('Reset password error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12'>
      <div className='w-full max-w-md'>
        {/* Logo */}
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg'>
            <MessageCircle className='w-10 h-10 text-white' />
          </div>
          <h1 className='text-3xl font-bold text-text'>Chatify</h1>
        </div>

        <div className='bg-white rounded-2xl shadow-xl p-8'>
          {!success ? (
            <>
              {/* Header */}
              <div className='mb-6'>
                <h2 className='text-2xl font-bold text-text mb-2'>Reset Password</h2>
                <p className='text-text-secondary'>
                  Enter your new password below.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
                  <p className='text-red-600 text-sm'>{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* New Password */}
                <div>
                  <label className='block text-sm font-medium text-text mb-2'>
                    New Password
                  </label>
                  <div className='relative'>
                    <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-icon' />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className='w-full pl-12 pr-12 py-3 bg-bgInput border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none transition'
                      placeholder='Enter new password'
                      required
                      minLength={6}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-4 top-1/2 -translate-y-1/2 text-icon hover:text-primary transition'
                    >
                      {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                    </button>
                  </div>
                  <p className='text-xs text-text-secondary mt-1'>
                    Must be at least 6 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className='block text-sm font-medium text-text mb-2'>
                    Confirm Password
                  </label>
                  <div className='relative'>
                    <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-icon' />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className='w-full pl-12 pr-12 py-3 bg-bgInput border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none transition'
                      placeholder='Confirm new password'
                      required
                      minLength={6}
                    />
                    <button
                      type='button'
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className='absolute right-4 top-1/2 -translate-y-1/2 text-icon hover:text-primary transition'
                    >
                      {showConfirmPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type='submit'
                  disabled={isLoading}
                  className='w-full bg-gradient-to-r from-primary to-primary-dark hover:shadow-xl text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70'
                >
                  {isLoading ? (
                    <>
                      <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <Check className='w-5 h-5' />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className='text-center py-8'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg className='w-8 h-8 text-green-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                </div>
                <h3 className='text-2xl font-bold text-text mb-2'>Password Reset Successful!</h3>
                <p className='text-text-secondary mb-6'>
                  Your password has been successfully reset.
                </p>
                <p className='text-sm text-text-secondary'>
                  Redirecting to login page...
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className='text-center text-sm text-text-secondary mt-6'>
          Remember your password?{' '}
          <Link href='/login' className='text-primary hover:text-primary-dark font-semibold transition'>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPasswordPage
