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
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 md:col-span-2">
            <h2 className="text-2xl font-semibold text-white mb-2">Welcome to Sales Trainer</h2>
            <p className="text-slate-400 mb-6">
              Practice your sales skills with AI-powered voice conversations. Use ChatGPT's voice feature for realistic roleplay scenarios, then get instant feedback on your performance.
            </p>
            <button
              onClick={() => setShowPractice(true)}
              className="w-full rounded bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 text-lg"
            >
              Start Practice Session
            </button>
          </div>

          {/* Quick Stats Card */}
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Features</h2>
            <ul className="text-sm text-slate-300 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Voice Conversations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Custom Scenarios
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Instant AI Scoring
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Coaching Tips
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> No Limits
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-900 p-8">
          <h2 className="text-2xl font-semibold text-white mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">1</span>
              </div>
              <p className="text-white font-medium mb-1">Select Scenario</p>
              <p className="text-sm text-slate-400">Choose a customer type</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">2</span>
              </div>
              <p className="text-white font-medium mb-1">Voice Call</p>
              <p className="text-sm text-slate-400">Practice with ChatGPT</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">3</span>
              </div>
              <p className="text-white font-medium mb-1">Submit Transcript</p>
              <p className="text-sm text-slate-400">Paste conversation</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">4</span>
              </div>
              <p className="text-white font-medium mb-1">Get Feedback</p>
              <p className="text-sm text-slate-400">See your score & tips</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
