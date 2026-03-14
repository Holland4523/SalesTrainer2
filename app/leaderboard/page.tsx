'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function LeaderboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
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
          <h1 className="mb-8 text-3xl font-bold text-white">Leaderboard</h1>

          <div className="rounded-lg border border-white/5 bg-dark-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-dark-surface">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/40">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/40">Rep</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/40">Avg Score</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/40">Sessions</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-white/40">
                      No sessions yet
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry, index) => (
                    <tr key={entry.id} className="border-b border-white/5 hover:bg-dark-surface/50">
                      <td className="px-6 py-3 text-white/60">#{index + 1}</td>
                      <td className="px-6 py-3 text-white">{entry.email}</td>
                      <td className="px-6 py-3 text-white font-semibold">{entry.avgScore}%</td>
                      <td className="px-6 py-3 text-white/60">{entry.sessions}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
