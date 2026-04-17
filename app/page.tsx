'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

const MASTER_EMAIL = 'dutchpeil@gmail.com'
const MASTER_PASSWORD = 'Holland126'

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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [inRoleplay, setInRoleplay] = useState(false)
  const [input, setInput] = useState('')
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null)
  const [isScoring, setIsScoring] = useState(false)
  const [copied, setCopied] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/roleplay' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Login handler - master account only (case-insensitive email)
  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (email.toLowerCase().trim() === MASTER_EMAIL.toLowerCase() && password === MASTER_PASSWORD) {
      setIsLoggedIn(true)
      setLoginError('')
    } else {
      setLoginError('Invalid credentials')
    }
  }

  // Start roleplay
  function startRoleplay() {
    setMessages([])
    setScoreResult(null)
    setInRoleplay(true)
  }

  // End roleplay and get transcript
  function endRoleplay() {
    setInRoleplay(false)
  }

  // Get transcript text
  function getTranscript() {
    return messages.map(m => {
      const text = m.parts?.filter(p => p.type === 'text').map(p => (p as any).text).join('') || ''
      return `${m.role === 'user' ? 'Rep' : 'Customer'}: ${text}`
    }).join('\n\n')
  }

  // Copy transcript
  function copyTranscript() {
    navigator.clipboard.writeText(getTranscript())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Score transcript
  async function scoreTranscript() {
    const transcript = getTranscript()
    if (!transcript || isScoring) return
    
    setIsScoring(true)
    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setScoreResult(data)
    } catch (err) {
      console.error('Scoring failed:', err)
    } finally {
      setIsScoring(false)
    }
  }

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold text-white text-center mb-2">Sales Trainer</h1>
          <p className="text-slate-400 text-center mb-8">Practice your pitch</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition"
            >
              Sign In
            </button>
          </form>
          
          <p className="text-slate-600 text-xs text-center mt-6">
            Hint: dutchpeil@gmail.com
          </p>
        </div>
      </div>
    )
  }

  // ROLEPLAY SCREEN (fullscreen, no sidebar)
  if (inRoleplay) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h1 className="text-lg font-semibold text-white">Roleplay Session</h1>
          <button
            onClick={endRoleplay}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500"
          >
            End Session
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 py-12">
              <p className="text-lg mb-2">Start the conversation</p>
              <p className="text-sm">You just knocked on the door. Greet the homeowner!</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-white'
                }`}
              >
                <p className="text-xs font-medium mb-1 opacity-70">
                  {message.role === 'user' ? 'You (Sales Rep)' : 'Customer'}
                </p>
                {message.parts?.map((part, i) => 
                  part.type === 'text' ? <span key={i}>{(part as any).text}</span> : null
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-2xl px-4 py-3 text-slate-400">
                Typing...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!input.trim() || isLoading) return
            sendMessage({ text: input })
            setInput('')
          }}
          className="p-4 border-t border-slate-800"
        >
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your sales pitch..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    )
  }

  // HOME SCREEN (after roleplay ended, show transcript and score)
  if (messages.length > 0) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto py-8">
          <h1 className="text-3xl font-bold text-white text-center mb-8">Session Complete</h1>
          
          {/* Score Card */}
          {scoreResult && (
            <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-700">
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-white mb-2">{scoreResult.overall_score}</div>
                <div className="text-slate-400">Overall Score</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">{scoreResult.rapport}</div>
                  <div className="text-xs text-slate-400">Rapport</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">{scoreResult.discovery}</div>
                  <div className="text-xs text-slate-400">Discovery</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{scoreResult.objection_handling}</div>
                  <div className="text-xs text-slate-400">Objections</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">{scoreResult.closing_strength}</div>
                  <div className="text-xs text-slate-400">Closing</div>
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-white mb-2">Coaching Summary</h3>
                <p className="text-slate-300 text-sm">{scoreResult.coaching_summary}</p>
              </div>
              
              {scoreResult.improvements.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Areas to Improve</h3>
                  <ul className="space-y-1">
                    {scoreResult.improvements.map((tip, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-blue-400">-</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Transcript */}
          <div className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-white">Transcript</h2>
              <button
                onClick={copyTranscript}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                {getTranscript()}
              </pre>
            </div>
          </div>
          
          {/* Actions */}
          {!scoreResult && (
            <button
              onClick={scoreTranscript}
              disabled={isScoring}
              className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition mb-3"
            >
              {isScoring ? 'Scoring...' : 'Get AI Score'}
            </button>
          )}
          
          <button
            onClick={startRoleplay}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition"
          >
            Start New Roleplay
          </button>
          
          <button
            onClick={() => { setMessages([]); setScoreResult(null) }}
            className="block mx-auto mt-4 text-slate-500 text-sm hover:text-slate-400"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  // MAIN SCREEN (start roleplay)
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-3">Sales Trainer</h1>
        <p className="text-slate-400 mb-12 max-w-md">
          Practice your door-to-door sales pitch with an AI customer. Get instant feedback on your performance.
        </p>
        
        <button
          onClick={startRoleplay}
          className="px-12 py-4 rounded-xl bg-blue-600 text-white text-xl font-semibold hover:bg-blue-500 transition"
        >
          Start Roleplay
        </button>
        
        <button
          onClick={() => setIsLoggedIn(false)}
          className="block mx-auto mt-8 text-slate-500 text-sm hover:text-slate-400"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
