'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import StatCard from '@/components/StatCard'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ totalSessions: 0, avgScore: 0, bestScore: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/')
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-bg">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          <h1 className="mb-8 text-3xl font-bold text-white">Dashboard</h1>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard label="Total Sessions" value={stats.totalSessions} />
            <StatCard label="Average Score" value={`${stats.avgScore}%`} />
            <StatCard label="Best Score" value={`${stats.bestScore}%`} />
          </div>

          <div className="rounded-lg border border-white/5 bg-dark-card p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Get Started</h2>
            <Link
              href="/practice"
              className="inline-block rounded-lg bg-amber-500 px-6 py-3 font-semibold text-black transition-all hover:bg-amber-400"
            >
              Start a Practice Session
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
