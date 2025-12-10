"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, Send, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)
    
    try {
      const response = await fetch('/api/auth/resetPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
      } else {
        setError(data.message || data.error || 'Failed to send reset link. Please try again.')
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
          {/* Back Button */}
          <Link 
            href='/login'
            className='inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition mb-6'
          >
            <ArrowLeft className='w-4 h-4' />
            Back to Login
          </Link>

          {!success ? (
            <>
              {/* Header */}
              <div className='mb-6'>
                <h2 className='text-2xl font-bold text-text mb-2'>Forgot Password?</h2>
                <p className='text-text-secondary'>
                  No worries! Enter your email address and we'll send you a link to reset your password.
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
                <div>
                  <label className='block text-sm font-medium text-text mb-2'>
                    Email Address
                  </label>
                  <div className='relative'>
                    <Mail className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-icon' />
                    <input
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='w-full pl-12 pr-4 py-3 bg-bgInput border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none transition'
                      placeholder='Enter your email'
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type='submit'
                  disabled={isLoading}
                  className='w-full bg-gradient-to-r from-primary to-primary-dark hover:shadow-xl text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70'
                >
                  {isLoading ? (
                    <>
                      <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <Send className='w-5 h-5 group-hover:translate-x-1 transition' />
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
                <h3 className='text-2xl font-bold text-text mb-2'>Check Your Email!</h3>
                <p className='text-text-secondary mb-6'>
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className='text-sm text-text-secondary mb-8'>
                  The link will expire in 15 minutes. If you don't receive the email, check your spam folder.
                </p>
                <Link
                  href='/login'
                  className='inline-flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition'
                >
                  <ArrowLeft className='w-5 h-5' />
                  Back to Login
                </Link>
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

export default ForgotPasswordPage
