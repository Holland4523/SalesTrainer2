'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { PracticeSession } from './PracticeSession'

export function Dashboard({ user }: { user: any }) {
  const router = useRouter()
  const [showPractice, setShowPractice] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (showPractice) {
    return (
      <PracticeSession
        userId={user.id}
        onBack={() => {
          setShowPractice(false)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Sales Trainer</h1>
            <p className="text-sm text-slate-400">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Quick Start Card */}
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Practice Session</h2>
            <p className="text-sm text-slate-400 mb-4">
              Practice a sales call with AI-generated scenarios
            </p>
            <button
              onClick={() => setShowPractice(true)}
              className="w-full rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700"
            >
              Start Practice
            </button>
          </div>

          {/* Stats Card */}
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Stats</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Sessions:</span>
                <span className="text-white font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Avg Score:</span>
                <span className="text-white font-semibold">--</span>
              </div>
            </div>
          </div>

          {/* Features Card */}
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Features</h2>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>✓ AI Scenarios</li>
              <li>✓ Instant Scoring</li>
              <li>✓ Coaching Tips</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
