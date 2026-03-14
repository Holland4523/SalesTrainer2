'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
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
        const { error: signupError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signupError) {
          setError(signupError.message)
          return
        }
        setMode('login')
        setPassword('')
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (loginError) {
          setError(loginError.message)
          return
        }
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-dark-bg">
      <div className="w-full max-w-sm rounded-lg border border-white/5 bg-dark-card p-8">
        <h1 className="mb-2 text-2xl font-bold text-white">PestPros Trainer</h1>
        <p className="mb-6 text-sm text-white/40">Master your sales skills with AI</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-dark-bg px-4 py-2 text-white placeholder-white/30 focus:border-amber-500 focus:outline-none"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-dark-bg px-4 py-2 text-white placeholder-white/30 focus:border-amber-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="rounded bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-500 py-2 font-semibold text-black transition-all hover:bg-amber-400 disabled:opacity-50"
          >
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-6">
          {mode === 'login' ? (
            <p className="text-center text-sm text-white/60">
              No account?{' '}
              <button
                onClick={() => {
                  setMode('signup')
                  setError('')
                }}
                className="text-amber-400 hover:text-amber-300"
              >
                Sign up here
              </button>
            </p>
          ) : (
            <p className="text-center text-sm text-white/60">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('login')
                  setError('')
                }}
                className="text-amber-400 hover:text-amber-300"
              >
                Sign in instead
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
