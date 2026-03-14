'use client'

import { useState } from 'react'

const SCENARIOS = [
  {
    id: 'skeptical',
    name: 'Skeptical Steve',
    description: 'Had a bad experience with pest control before',
    opener: "Yeah? What do you want? I've already been burned by pest companies.",
  },
  {
    id: 'busy',
    name: 'Busy Barbara',
    description: 'Always in a hurry, values time',
    opener: "Make it quick, I've got about two minutes.",
  },
  {
    id: 'price',
    name: 'Price-Focused Pete',
    description: 'Compares every quote, wants deals',
    opener: "How much? I've already got three quotes.",
  },
  {
    id: 'friendly',
    name: 'Friendly Fran',
    description: 'Warm and chatty, easy to build rapport',
    opener: "Oh hi there! I was just thinking about getting someone out here.",
  },
]

const DIFFICULTIES = [
  { level: 1, name: 'Easy', color: 'bg-green-500' },
  { level: 2, name: 'Medium', color: 'bg-yellow-500' },
  { level: 3, name: 'Hard', color: 'bg-orange-500' },
  { level: 4, name: 'Expert', color: 'bg-red-500' },
]

type View = 'home' | 'practice' | 'scoring' | 'results'

interface ScoreResult {
  overall_score: number
  rapport: number
  discovery: number
  objection_handling: number
  closing_strength: number
  coaching_summary: string
  improvements: string[]
}

export default function SalesTrainer() {
  const [view, setView] = useState<View>('home')
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0])
  const [difficulty, setDifficulty] = useState(2)
  const [transcript, setTranscript] = useState('')
  const [isScoring, setIsScoring] = useState(false)
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null)
  const [error, setError] = useState('')

  const generatePrompt = () => {
    const diff = DIFFICULTIES.find((d) => d.level === difficulty)
    return `You are ${selectedScenario.name}, a homeowner in Phoenix, AZ.

Personality: ${selectedScenario.description}
Opening line: "${selectedScenario.opener}"
Difficulty: ${diff?.name} (Level ${difficulty}/4)

Instructions:
- Stay in character as the homeowner throughout the conversation
- ${difficulty >= 3 ? 'Be resistant and raise objections' : 'Be somewhat open but have concerns'}
- ${difficulty >= 2 ? 'Ask about pricing and compare to competitors' : 'Focus on your pest problem'}
- The sales rep is selling quarterly pest control service ($149/quarter)
- ${difficulty === 4 ? 'Be very difficult to close - require multiple attempts' : ''}

Start the roleplay when the sales rep speaks first.`
  }

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatePrompt())
  }

  const openGPT = () => {
    window.open(
      'https://chatgpt.com/g/g-67be87f079888191bfa2e2dcd1e66771-sales-trainer',
      'SalesTrainerGPT',
      'width=500,height=700,left=100,top=100'
    )
  }

  const scoreTranscript = async () => {
    if (transcript.trim().length < 100) {
      setError('Transcript must be at least 100 characters')
      return
    }

    setError('')
    setIsScoring(true)
    setView('scoring')

    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to score transcript')
      }

      setScoreResult(data)
      setView('results')
    } catch (err: any) {
      setError(err.message || 'Scoring failed')
      setView('practice')
    } finally {
      setIsScoring(false)
    }
  }

  const resetSession = () => {
    setTranscript('')
    setScoreResult(null)
    setError('')
    setView('home')
  }

  // HOME VIEW
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-6">
        <div className="mx-auto max-w-4xl">
          <header className="mb-12 text-center">
            <h1 className="mb-2 text-4xl font-bold text-white">Sales Trainer</h1>
            <p className="text-slate-400">Practice sales calls with AI-powered scenarios</p>
          </header>

          <div className="mb-8 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Select Scenario</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario)}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    selectedScenario.id === scenario.id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                  }`}
                >
                  <div className="font-medium text-white">{scenario.name}</div>
                  <div className="mt-1 text-sm text-slate-400">{scenario.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Difficulty Level</h2>
            <div className="flex gap-3">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff.level}
                  onClick={() => setDifficulty(diff.level)}
                  className={`flex-1 rounded-lg border p-3 text-center transition-all ${
                    difficulty === diff.level
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                  }`}
                >
                  <div className={`mx-auto mb-2 h-2 w-2 rounded-full ${diff.color}`} />
                  <div className="text-sm font-medium text-white">{diff.name}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setView('practice')}
            className="w-full rounded-xl bg-amber-500 py-4 text-lg font-semibold text-black transition-colors hover:bg-amber-400"
          >
            Start Practice Session
          </button>
        </div>
      </div>
    )
  }

  // PRACTICE VIEW
  if (view === 'practice') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-6">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => setView('home')}
            className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedScenario.name}</h2>
                <p className="text-sm text-slate-400">
                  {selectedScenario.description} | Level {difficulty}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyPrompt}
                  className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
                >
                  Copy Prompt
                </button>
                <button
                  onClick={openGPT}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-500"
                >
                  Open GPT
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-slate-900/50 p-4">
              <p className="text-sm text-slate-300">
                <strong>Opening:</strong> &quot;{selectedScenario.opener}&quot;
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Paste Your Transcript</h3>
            <p className="mb-4 text-sm text-slate-400">
              After practicing with the GPT, copy the entire conversation and paste it below for
              scoring.
            </p>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your sales call transcript here..."
              className="mb-4 h-64 w-full resize-none rounded-lg border border-slate-600 bg-slate-900 p-4 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
            )}

            <button
              onClick={scoreTranscript}
              disabled={transcript.trim().length < 100}
              className="w-full rounded-xl bg-amber-500 py-4 text-lg font-semibold text-black transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Score My Call
            </button>
          </div>
        </div>
      </div>
    )
  }

  // SCORING VIEW
  if (view === 'scoring') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-lg text-white">Analyzing your sales call...</p>
          <p className="mt-2 text-sm text-slate-400">This may take a few seconds</p>
        </div>
      </div>
    )
  }

  // RESULTS VIEW
  if (view === 'results' && scoreResult) {
    const scoreColor = (score: number) => {
      if (score >= 80) return 'text-green-400'
      if (score >= 60) return 'text-yellow-400'
      return 'text-red-400'
    }

    const scores = [
      { label: 'Rapport', value: scoreResult.rapport },
      { label: 'Discovery', value: scoreResult.discovery },
      { label: 'Objection Handling', value: scoreResult.objection_handling },
      { label: 'Closing Strength', value: scoreResult.closing_strength },
    ]

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <div className={`mb-2 text-6xl font-bold ${scoreColor(scoreResult.overall_score)}`}>
              {scoreResult.overall_score}
            </div>
            <p className="text-slate-400">Overall Score</p>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-4">
            {scores.map((score) => (
              <div
                key={score.label}
                className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-center"
              >
                <div className={`text-2xl font-bold ${scoreColor(score.value)}`}>{score.value}</div>
                <div className="mt-1 text-sm text-slate-400">{score.label}</div>
              </div>
            ))}
          </div>

          <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-3 text-lg font-semibold text-white">Coaching Summary</h3>
            <p className="text-slate-300">{scoreResult.coaching_summary}</p>
          </div>

          <div className="mb-8 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-3 text-lg font-semibold text-white">Areas to Improve</h3>
            <ul className="space-y-2">
              {scoreResult.improvements.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={resetSession}
            className="w-full rounded-xl bg-amber-500 py-4 text-lg font-semibold text-black transition-colors hover:bg-amber-400"
          >
            Practice Again
          </button>
        </div>
      </div>
    )
  }

  return null
}
