'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ScenarioSelector from '@/components/ScenarioSelector'
import TrainerConsole from '@/components/TrainerConsole'
import SubscriptionGate from '@/components/SubscriptionGate'

const SCENARIOS = [
  {
    id: 1,
    label: 'Skeptical Homeowner',
    personality: 'skeptical',
    pest: 'ants',
    season: 'spring',
    competitor: 'Terminix',
  },
  {
    id: 2,
    label: 'Friendly but Hesitant',
    personality: 'friendly',
    pest: 'spiders',
    season: 'summer',
    competitor: 'none',
  },
  {
    id: 3,
    label: 'Busy / Time-Pressured',
    personality: 'busy',
    pest: 'rodents',
    season: 'fall',
    competitor: 'Orkin',
  },
  {
    id: 4,
    label: 'Budget-Conscious',
    personality: 'frugal',
    pest: 'mosquitoes',
    season: 'spring',
    competitor: 'none',
  },
]

export default function PracticePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [phase, setPhase] = useState<'setup' | 'training'>('setup')
  const [scenario, setScenario] = useState(SCENARIOS[0])
  const [difficulty, setDifficulty] = useState(2)
  const [subscriptionTier, setSubscriptionTier] = useState('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/')
        return
      }

      setUser(session.user)

      // Check subscription
      const response = await fetch('/api/entitlement', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await response.json()
      setSubscriptionTier(data.tier || 'free')
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-bg">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Master account bypass
  const isMasterAccount = user?.email === 'dutchpeil@gmail.com'
  
  if (subscriptionTier === 'free' && !isMasterAccount) {
    return (
      <div className="flex h-screen bg-dark-bg">
        <Sidebar />
        <div className="flex-1">
          <SubscriptionGate />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        {phase === 'setup' ? (
          <ScenarioSelector
            scenarios={SCENARIOS}
            selected={scenario}
            onSelect={setScenario}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            onStart={() => setPhase('training')}
          />
        ) : (
          <TrainerConsole scenario={scenario} difficulty={difficulty} onBack={() => setPhase('setup')} />
        )}
      </div>
    </div>
  )
}
