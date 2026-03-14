'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [teamSessions, setTeamSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/')
        return
      }

      setUser(session.user)

      // For now, show only user's own sessions
      // In production, this would check role and show team sessions
      setTeamSessions([])
      setLoading(false)
    }

    loadData()
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
          <h1 className="mb-8 text-3xl font-bold text-white">Team Manager</h1>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
            <div className="rounded-lg border border-white/5 bg-dark-card p-6">
              <p className="mb-2 text-xs font-semibold text-white/50">TEAM MEMBERS</p>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-dark-card p-6">
              <p className="mb-2 text-xs font-semibold text-white/50">TOTAL SESSIONS</p>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-dark-card p-6">
              <p className="mb-2 text-xs font-semibold text-white/50">AVG TEAM SCORE</p>
              <p className="text-3xl font-bold text-white">-</p>
            </div>
          </div>

          <div className="rounded-lg border border-white/5 bg-dark-card overflow-hidden">
            <div className="border-b border-white/5 bg-dark-surface p-6">
              <h2 className="font-semibold text-white">Recent Sessions</h2>
            </div>
            <div className="p-6 text-center text-white/40">
              No sessions yet. Team members will appear here as they start training.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
