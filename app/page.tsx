'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

const MASTER_EMAIL = 'dutchpeil@gmail.com'
const MASTER_PASSWORD = 'Holland126'

export default function SalesTrainer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [inRoleplay, setInRoleplay] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/roleplay' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Login handler - master account only
  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (email === MASTER_EMAIL && password === MASTER_PASSWORD) {
      setIsLoggedIn(true)
      setLoginError('')
    } else {
      setLoginError('Invalid credentials')
    }
  }

  // Start roleplay
  function startRoleplay() {
    setMessages([])
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
  }

  // Score transcript
  async function scoreTranscript() {
    const transcript = getTranscript()
    if (!transcript) return
    
    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      })
      const data = await res.json()
      alert(`Score: ${data.overall_score}/100\n\n${data.coaching_summary}`)
    } catch {
      alert('Scoring failed')
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
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
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

  // HOME SCREEN (after roleplay ended, show transcript)
  if (messages.length > 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-white text-center mb-2">Session Complete</h1>
          <p className="text-slate-400 text-center mb-8">Your conversation transcript</p>
          
          <div className="bg-slate-900 rounded-lg p-4 mb-6 max-h-96 overflow-y-auto">
            <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
              {getTranscript()}
            </pre>
          </div>
          
          <div className="flex gap-3 mb-4">
            <button
              onClick={copyTranscript}
              className="flex-1 py-3 rounded-lg border border-slate-600 text-white font-medium hover:bg-slate-800 transition"
            >
              Copy Transcript
            </button>
            <button
              onClick={scoreTranscript}
              className="flex-1 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-500 transition"
            >
              Get Score
            </button>
          </div>
          
          <button
            onClick={() => { setMessages([]); setInRoleplay(true) }}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition"
          >
            Start New Roleplay
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
