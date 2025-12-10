"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, MessageCircle, ArrowRight, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { loginUser } from '@/store/features/auth/userSlice'
import { useAppDispatch } from '@/store/hooks/hooks'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const[error,setError]=useState("")
  const router=useRouter()
  const dispatch=useAppDispatch()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const result = await dispatch(loginUser({email, password}))
      
      if (loginUser.fulfilled.match(result)) {
        // Success - redirect to home
        console.log('Login successful:', result.payload)
        router.push("/")
      } else if (loginUser.rejected.match(result)) {
        // Handle error
        const errorMessage = result.payload as string || "Failed to login. Please check your credentials."
        setError(errorMessage)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex'>
      {/* Left Side - Branding */}
      <div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-dark p-12 flex-col justify-between relative overflow-hidden'>
        {/* Decorative Elements */}
        <div className='absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl'></div>
        <div className='absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl'></div>
        
        <div className='relative z-10'>
          <div className='flex items-center gap-3 mb-8'>
            <div className='w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl'>
              <MessageCircle className='w-10 h-10 text-primary' />
            </div>
            <h1 className='text-4xl font-bold text-white'>Chatify</h1>
          </div>
          
          <div className='space-y-6 mt-16'>
            <h2 className='text-5xl font-bold text-white leading-tight'>
              Connect with<br />friends & family<br />instantly
            </h2>
            <p className='text-xl text-white/90 max-w-md'>
              Secure messaging with end-to-end encryption. Stay connected with the people that matter most.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className='relative z-10 grid grid-cols-3 gap-4'>
          <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20'>
            <div className='text-3xl mb-2'>🔒</div>
            <p className='text-white text-sm font-medium'>Secure</p>
          </div>
          <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20'>
            <div className='text-3xl mb-2'>⚡</div>
            <p className='text-white text-sm font-medium'>Fast</p>
          </div>
          <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20'>
            <div className='text-3xl mb-2'>🌍</div>
            <p className='text-white text-sm font-medium'>Global</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className='flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12'>
        <div className='w-full max-w-md'>
          {/* Mobile Logo */}
          <div className='lg:hidden text-center mb-8'>
            <div className='w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg'>
              <MessageCircle className='w-10 h-10 text-white' />
            </div>
            <h1 className='text-3xl font-bold text-text'>Chatify</h1>
          </div>

          {/* Welcome Text */}
          <div className='text-center mb-8'>
            <h2 className='text-3xl font-bold text-text mb-2 flex items-center justify-center gap-2'>
              Welcome Back! <Sparkles className='w-6 h-6 text-primary' />
            </h2>
            <p className='text-text-secondary'>Sign in to continue your conversations</p>
          </div>

          {/* Login Form Card */}
          <div className='bg-white rounded-3xl shadow-2xl p-8 border border-border/50 backdrop-blur-sm'>
            <form onSubmit={handleLogin} className='space-y-6'>
              {/* Error Message */}
              {error && (
                <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm'>
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor='email' className='block text-sm font-semibold text-text mb-2'>
                  Email Address
                </label>
                <div className='relative'>
                  <Mail className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-icon' />
                  <input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='w-full pl-12 pr-4 py-3.5 bg-bgInput border-2 border-transparent rounded-xl outline-none focus:border-primary focus:bg-white transition text-text placeholder:text-text-secondary/50'
                    placeholder='you@example.com'
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor='password' className='block text-sm font-semibold text-text mb-2'>
                  Password
                </label>
                <div className='relative'>
                  <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-icon' />
                  <input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='w-full pl-12 pr-12 py-3.5 bg-bgInput border-2 border-transparent rounded-xl outline-none focus:border-primary focus:bg-white transition text-text placeholder:text-text-secondary/50'
                    placeholder='••••••••'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-icon hover:text-primary transition'
                  >
                    {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className='flex items-center justify-between'>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input type='checkbox' className='w-4 h-4 accent-primary rounded' />
                  <span className='text-sm text-text-secondary'>Remember me</span>
                </label>
                <Link href='/forgot-password' className='text-sm text-primary hover:text-primary-dark font-medium transition'>
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type='submit'
                disabled={isLoading}
                className='w-full bg-gradient-to-r from-primary to-primary-dark hover:shadow-xl text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70'
              >
                {isLoading ? (
                  <>
                    <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition' />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className='relative my-6'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-border'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-4 bg-white text-text-secondary font-medium'>OR</span>
              </div>
            </div>

            {/* Social Login */}
            <div className='space-y-3'>
              <button className='w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-border hover:border-primary rounded-xl transition font-medium text-text hover:bg-bgInput'>
                <svg className='w-5 h-5' viewBox='0 0 24 24'>
                  <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/>
                  <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/>
                  <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/>
                  <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/>
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Register Link */}
            <div className='text-center mt-6'>
              <p className='text-text-secondary'>
                Don't have an account?{' '}
                <Link href='/register' className='text-primary hover:text-primary-dark font-semibold transition'>
                  Create Account
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className='text-center text-xs text-text-secondary mt-8'>
            By signing in, you agree to our{' '}
            <Link href='/terms' className='text-primary hover:underline'>Terms</Link>
            {' '}and{' '}
            <Link href='/privacy' className='text-primary hover:underline'>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
