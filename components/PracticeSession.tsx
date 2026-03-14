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
    prompt: 'You are a homeowner who discovered roaches in your kitchen last week. You are skeptical about pest control companies because a friend had a bad experience. Ask tough questions about their service and warranty.',
  },
  {
    id: 2,
    title: 'Termite Concern',
    description: 'Customer worried about termites in basement',
    prompt: 'I found some wood damage in my basement and I am worried it might be termites. I\'ve already gotten two quotes from other companies. Ask me why I should choose you instead.',
  },
  {
    id: 3,
    title: 'Seasonal Mosquitoes',
    description: 'Customer dealing with mosquito problem',
    prompt: 'Every summer we get bitten by mosquitoes in our backyard. Can you help? We have a small budget and are price-sensitive. I need to know it will actually work before committing.',
  },
  {
    id: 4,
    title: 'Friendly New Homeowner',
    description: 'New homeowner wants preventative care',
    prompt: 'We just bought a house and want to make sure we don\'t get any pest problems. We\'re willing to invest in good prevention but want to understand what we\'re paying for.',
  },
]

export function PracticeSession({ userId, onBack }: PracticeSessionProps) {
  const [step, setStep] = useState<'scenario' | 'gpt' | 'transcript' | 'results'>('scenario')
  const [selectedScenario, setSelectedScenario] = useState<(typeof scenarios)[0] | null>(null)
  const [transcript, setTranscript] = useState('')
  const [score, setScore] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  function generateGPTPrompt() {
    if (!selectedScenario) return ''
    return `Act as a pest control sales representative. The customer will be: ${selectedScenario.prompt}. 

Your goal is to:
1. Build rapport and understand their problem
2. Ask discovery questions about the infestation
3. Handle their objections professionally
4. Close the sale or at least get a follow-up meeting

Be natural and conversational. Listen to what they say and respond appropriately.`
  }

  function copyPrompt() {
    const prompt = generateGPTPrompt()
    navigator.clipboard.writeText(prompt)
  }

  function launchGPTCall() {
    // Open the ChatGPT custom GPT in a new window for voice conversation
    window.open(
      'https://chatgpt.com/g/g-67be87f079888191bfa2e2dcd1e66771-sales-trainer',
      'gpt_voice',
      'width=1200,height=800,toolbar=no,location=no'
    )
  }

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
                    setStep('gpt')
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

        {step === 'gpt' && selectedScenario && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{selectedScenario.title}</h1>
            <p className="text-slate-400 mb-8">{selectedScenario.description}</p>
            
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-8 mb-6">
              <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-lg p-8 text-center border border-blue-700/50 mb-6">
                <h2 className="text-2xl font-bold text-white mb-3">Voice Practice Session</h2>
                <p className="text-slate-300 mb-6">Use voice chat with the Custom GPT to practice your sales pitch. Click the speaker icon in ChatGPT to enable voice mode.</p>
                
                <div className="bg-slate-800/50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-slate-400 mb-2">Customer Profile:</p>
                  <p className="text-white">{selectedScenario.prompt}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={copyPrompt}
                    className="flex-1 rounded-lg border border-blue-500 bg-transparent px-6 py-3 font-semibold text-blue-400 hover:bg-blue-500/10 transition"
                  >
                    Copy Scenario
                  </button>
                  <button
                    onClick={launchGPTCall}
                    className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 transition"
                  >
                    Start Voice Call
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Instructions:</h3>
                <ol className="text-slate-300 space-y-2 list-decimal list-inside">
                  <li>Click "Start Voice Call" to open ChatGPT</li>
                  <li>Paste the scenario in the chat</li>
                  <li>Click the speaker icon to enable voice mode</li>
                  <li>Have a natural conversation with the customer</li>
                  <li>After the call, copy the transcript and paste it below to get scored</li>
                </ol>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('scenario')}
                className="flex-1 rounded bg-slate-700 px-6 py-3 font-medium text-white hover:bg-slate-600"
              >
                Back to Scenarios
              </button>
              <button
                onClick={() => setStep('transcript')}
                className="flex-1 rounded bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
              >
                Skip to Transcript →
              </button>
            </div>
          </div>
        )}

        {step === 'transcript' && selectedScenario && (
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
