"use client"
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, MessageCircle, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'

const VerifyEmailPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!email) {
      router.push('/register')
    }
  }, [email, router])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError('')

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto submit when all filled
    if (index === 5 && value && newOtp.every(digit => digit !== '')) {
      handleVerify(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6)
    setOtp(newOtp)

    if (pastedData.length === 6) {
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (otpCode: string = otp.join('')) => {
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verifyUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otpCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: 'resend', // Dummy password for resend
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP')
      }

      setResendTimer(60)
      setCanResend(false)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center px-4'>
        <div className='text-center'>
          <div className='w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce'>
            <CheckCircle2 className='w-12 h-12 text-green-600' />
          </div>
          <h2 className='text-3xl font-bold text-text mb-2'>Email Verified!</h2>
          <p className='text-text-secondary mb-4'>Your account has been successfully verified.</p>
          <p className='text-sm text-text-secondary'>Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center px-4 py-12'>
      <div className='w-full max-w-md'>
        {/* Logo */}
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg'>
            <MessageCircle className='w-10 h-10 text-white' />
          </div>
          <h1 className='text-3xl font-bold text-text mb-2'>Verify Your Email</h1>
          <p className='text-text-secondary'>
            We've sent a 6-digit code to<br />
            <span className='font-medium text-primary'>{email}</span>
          </p>
        </div>

        {/* Verification Card */}
        <div className='bg-white rounded-3xl shadow-2xl p-8 border border-border/50'>
          {/* Error Message */}
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2'>
              <AlertCircle className='w-4 h-4 shrink-0' />
              {error}
            </div>
          )}

          {/* OTP Input */}
          <div className='mb-6'>
            <label className='block text-sm font-semibold text-text mb-4 text-center'>
              Enter Verification Code
            </label>
            <div className='flex gap-2 justify-center' onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type='text'
                  inputMode='numeric'
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className='w-12 h-14 text-center text-2xl font-bold bg-bgInput border-2 border-transparent rounded-xl outline-none focus:border-primary focus:bg-white transition'
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleVerify()}
            disabled={isLoading || otp.some(digit => digit === '')}
            className='w-full bg-gradient-to-r from-primary to-primary-dark hover:shadow-xl text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mb-6'
          >
            {isLoading ? (
              <>
                <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                Verifying...
              </>
            ) : (
              <>
                Verify Email
                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition' />
              </>
            )}
          </button>

          {/* Resend OTP */}
          <div className='text-center'>
            <p className='text-sm text-text-secondary mb-2'>
              Didn't receive the code?
            </p>
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={isLoading}
                className='text-primary hover:text-primary-dark font-semibold transition disabled:opacity-50'
              >
                Resend Code
              </button>
            ) : (
              <p className='text-sm text-text-secondary'>
                Resend in <span className='font-semibold text-primary'>{resendTimer}s</span>
              </p>
            )}
          </div>

          {/* Divider */}
          <div className='relative my-6'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-border'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-4 bg-white text-text-secondary font-medium'>OR</span>
            </div>
          </div>

          {/* Back to Register */}
          <div className='text-center'>
            <p className='text-text-secondary text-sm'>
              Wrong email?{' '}
              <Link href='/register' className='text-primary hover:text-primary-dark font-semibold transition'>
                Go Back
              </Link>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className='mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4'>
          <div className='flex gap-3'>
            <Mail className='w-5 h-5 text-blue-600 shrink-0 mt-0.5' />
            <div className='text-sm text-blue-800'>
              <p className='font-medium mb-1'>Check your email</p>
              <p className='text-blue-700'>
                The code will expire in 5 minutes. Don't forget to check your spam folder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage
