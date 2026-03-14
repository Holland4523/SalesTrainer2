'use client'

import { useState } from 'react'

interface PracticeSessionProps {
  userId: string
  onBack: () => void
}

const scenarios = [
  {
    id: 1,
    title: 'Homeowner with Roaches',
    description: 'Customer has pest issues in kitchen',
    prompt: 'You are a homeowner who discovered roaches in your kitchen last week...',
  },
  {
    id: 2,
    title: 'Termite Concern',
    description: 'Customer worried about termites in basement',
    prompt: 'I found some wood damage in my basement and I am worried it might be termites...',
  },
  {
    id: 3,
    title: 'Seasonal Mosquitoes',
    description: 'Customer dealing with mosquito problem',
    prompt: 'Every summer we get bitten by mosquitoes in our backyard. Can you help?',
  },
]

export function PracticeSession({ userId, onBack }: PracticeSessionProps) {
  const [step, setStep] = useState<'scenario' | 'practice' | 'results'>('scenario')
  const [selectedScenario, setSelectedScenario] = useState<(typeof scenarios)[0] | null>(null)
  const [transcript, setTranscript] = useState('')
  const [score, setScore] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmitTranscript() {
    if (!transcript.trim()) {
      alert('Please enter a transcript')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to score transcript')
      }
      
      const result = await response.json()
      setScore(result)
      setStep('results')
    } catch (error) {
      console.error('Scoring error:', error)
      alert('Failed to score transcript. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="rounded bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {step === 'scenario' && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">Select a Scenario</h1>
            <div className="grid gap-4">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => {
                    setSelectedScenario(scenario)
                    setStep('practice')
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-900 p-6 text-left hover:border-blue-500 hover:bg-slate-800 transition"
                >
                  <h3 className="text-lg font-semibold text-white">{scenario.title}</h3>
                  <p className="text-slate-400">{scenario.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'practice' && selectedScenario && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">{selectedScenario.title}</h1>
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-2">Scenario:</h2>
              <p className="text-slate-300">{selectedScenario.prompt}</p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Call Transcript</h2>
              <p className="text-sm text-slate-400 mb-3">Paste the transcript of your sales call below</p>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Rep: Hello! Did I catch you at a bad time?
Customer: No, actually..."
                className="w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none h-64 font-mono text-sm"
              />

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setStep('scenario')
                    setTranscript('')
                  }}
                  className="rounded bg-slate-700 px-6 py-2 font-medium text-white hover:bg-slate-600"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitTranscript}
                  disabled={loading}
                  className="flex-1 rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Scoring...' : 'Submit & Score'}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'results' && score && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">Your Score</h1>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                <p className="text-slate-400 text-sm">Overall</p>
                <p className="text-3xl font-bold text-blue-400">{score.overall_score}</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                <p className="text-slate-400 text-sm">Rapport</p>
                <p className="text-3xl font-bold text-green-400">{score.rapport}</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                <p className="text-slate-400 text-sm">Discovery</p>
                <p className="text-3xl font-bold text-purple-400">{score.discovery}</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                <p className="text-slate-400 text-sm">Objection</p>
                <p className="text-3xl font-bold text-orange-400">{score.objection_handling}</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                <p className="text-slate-400 text-sm">Closing</p>
                <p className="text-3xl font-bold text-red-400">{score.closing_strength}</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-3">Coaching Summary</h2>
              <p className="text-slate-300 mb-4">{score.coaching_summary}</p>
              <h3 className="font-semibold text-white mb-2">Improvements:</h3>
              <ul className="space-y-1 text-slate-300">
                {score.improvements.map((tip: string, i: number) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep('scenario')
                  setTranscript('')
                  setScore(null)
                }}
                className="flex-1 rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700"
              >
                Try Another Scenario
              </button>
              <button
                onClick={onBack}
                className="flex-1 rounded bg-slate-700 py-2 font-medium text-white hover:bg-slate-600"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
