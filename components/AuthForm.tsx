'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function AuthForm() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        // Auto-confirm master account
        const isMasterAccount = email === 'dutchpeil@gmail.com' && password === 'Holland126'
        
        const { data: signupData, error: err } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: undefined,
            data: {
              auto_confirmed: isMasterAccount,
            }
          }
        })
        
        if (err) {
          setError(err.message)
          return
        }

        // If master account, auto-confirm by signing in
        if (isMasterAccount && signupData.user) {
          setTimeout(async () => {
            const { error: signInErr } = await supabase.auth.signInWithPassword({ 
              email, 
              password 
            })
            if (!signInErr) {
              router.push('/dashboard')
            }
          }, 500)
          setError('Master account created. Signing in...')
          return
        }

        setError('Check your email to confirm signup')
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) {
          setError(err.message)
          return
        }
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Sales Trainer</h1>
          <p className="text-slate-400 mb-6">AI-powered sales practice</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div className="rounded bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-center text-sm text-slate-400">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login')
                  setError('')
                }}
                className="text-blue-400 hover:text-blue-300"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
