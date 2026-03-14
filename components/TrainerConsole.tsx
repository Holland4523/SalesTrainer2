'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase-client'

interface TrainerConsoleProps {
  scenario: {
    id: number
    label: string
    personality: string
    pest: string
    season: string
    competitor: string
  }
  difficulty: number
  onBack: () => void
}

export default function TrainerConsole({ scenario, difficulty, onBack }: TrainerConsoleProps) {
  const [phase, setPhase] = useState<'prompt' | 'recording' | 'results'>('prompt')
  const [transcript, setTranscript] = useState('')
  const [scores, setScores] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const systemPrompt = `You are a ${scenario.personality} homeowner calling about a potential ${scenario.pest} problem in your home. 
It's ${scenario.season} and you may have called other pest control companies like ${scenario.competitor}.
Difficulty level: ${difficulty}/4
Respond naturally to the sales rep's questions and objections.`

  function copyPrompt() {
    navigator.clipboard.writeText(systemPrompt)
  }

  function openGPT() {
    const gptUrl = 'https://chatgpt.com/g/g-67be87f079888191bfa2e2dcd1e66771-sales-trainer'
    window.open(gptUrl, 'gpt_window', 'width=980,height=860,resizable=yes,scrollbars=yes')
  }

  async function submitTranscript() {
    if (!transcript || transcript.length < 100) {
      setError('Transcript must be at least 100 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError('Not authenticated')
        return
      }

      const response = await fetch('/api/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ transcript }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to score transcript')
        return
      }

      setScores(data)
      setPhase('results')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <button
        onClick={onBack}
        className="mb-6 text-sm text-white/60 hover:text-white transition-colors"
      >
        ← Back to Setup
      </button>

      {phase === 'prompt' && (
        <div className="max-w-2xl">
          <h1 className="mb-6 text-3xl font-bold text-white">Training Session</h1>

          <div className="mb-6 space-y-4">
            <div className="rounded-lg border border-green-500/30 bg-green-900/20 p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Voice Practice Session</h2>
                  <p className="text-green-400 text-sm">Click the mic icon in ChatGPT for voice mode</p>
                </div>
              </div>
              
              <p className="text-white/80 mb-4">Practice your sales pitch with AI-powered voice conversations. The GPT will act as a real customer based on your scenario.</p>
              
              <button
                onClick={openGPT}
                className="w-full rounded-lg bg-green-600 px-6 py-4 font-bold text-white text-lg hover:bg-green-500 transition-colors mb-3"
              >
                Start Voice Call with GPT
              </button>
              
              <button
                onClick={copyPrompt}
                className="w-full rounded-lg border border-white/20 px-4 py-2 font-medium text-white/70 hover:bg-white/5 text-sm"
              >
                Copy Scenario Prompt
              </button>
            </div>
            
            <div className="rounded-lg border border-white/5 bg-dark-card p-6">
              <h2 className="mb-3 font-semibold text-white">Scenario: {scenario.label}</h2>
              <p className="font-mono text-xs text-white/50 mb-4 p-4 bg-dark-bg rounded">
                {systemPrompt}
              </p>
            </div>

            <div className="rounded-lg border border-white/5 bg-dark-card p-6">
              <h2 className="mb-3 font-semibold text-white">Paste Transcript</h2>
              <textarea
                ref={textareaRef}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your sales conversation here..."
                className="w-full h-48 rounded-lg border border-white/10 bg-dark-bg p-4 text-white placeholder-white/30 focus:border-amber-500 focus:outline-none"
              />

              {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

              <button
                onClick={() => setPhase('recording')}
                className="mt-4 rounded-lg bg-amber-500 px-6 py-2 font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
                disabled={!transcript || transcript.length < 100}
              >
                Next: Submit for Scoring
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'recording' && (
        <div className="max-w-2xl">
          <h1 className="mb-6 text-3xl font-bold text-white">Submit Transcript</h1>

          <div className="rounded-lg border border-white/5 bg-dark-card p-6 mb-6">
            <h2 className="mb-3 font-semibold text-white">Review</h2>
            <p className="text-white/70 mb-4">{transcript}</p>

            {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={submitTranscript}
                disabled={loading}
                className="flex-1 rounded-lg bg-amber-500 px-6 py-2 font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
              >
                {loading ? 'Scoring...' : 'Submit for AI Scoring'}
              </button>
              <button
                onClick={() => setPhase('prompt')}
                className="flex-1 rounded-lg border border-white/10 px-6 py-2 font-semibold text-white hover:bg-white/5"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'results' && scores && (
        <div className="max-w-2xl">
          <h1 className="mb-6 text-3xl font-bold text-white">Session Results</h1>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-6">
              <p className="mb-2 text-xs font-semibold text-white/50">OVERALL SCORE</p>
              <p className="text-4xl font-bold text-amber-400">{scores.overall_score}%</p>
            </div>

            {[
              { label: 'Rapport', score: scores.rapport },
              { label: 'Discovery', score: scores.discovery },
              { label: 'Objection Handling', score: scores.objection_handling },
              { label: 'Closing Strength', score: scores.closing_strength },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-white/5 bg-dark-card p-6"
              >
                <p className="mb-2 text-xs font-semibold text-white/50">{item.label}</p>
                <p className="text-3xl font-bold text-white">{item.score}%</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-white/5 bg-dark-card p-6 mb-6">
            <h2 className="mb-3 font-semibold text-white">Coaching Summary</h2>
            <p className="text-white/70 mb-4">{scores.coaching_summary}</p>

            <h3 className="mb-3 font-semibold text-white">Areas to Improve</h3>
            <ul className="space-y-2">
              {scores.improvements.map((imp: string, i: number) => (
                <li key={i} className="text-white/70 flex gap-2">
                  <span className="text-amber-400">•</span>
                  {imp}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 rounded-lg bg-amber-500 px-6 py-2 font-semibold text-black hover:bg-amber-400"
            >
              Start Another Session
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
