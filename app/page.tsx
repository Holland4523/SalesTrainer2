'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthForm } from '@/components/AuthForm'
import { Dashboard } from '@/components/Dashboard'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return user ? <Dashboard user={user} /> : <AuthForm />
}
