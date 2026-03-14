'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function BillingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const PLANS = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$29',
      features: ['5 sessions/month', 'Basic scoring', 'Email support'],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$99',
      features: ['Unlimited sessions', 'Advanced analytics', 'Priority support'],
    },
    {
      id: 'team',
      name: 'Team',
      price: '$299',
      features: ['Unlimited everything', '5 team seats', 'Manager dashboard'],
    },
  ]

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

  async function handleCheckout(planId: string) {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, email: user?.email }),
    })

    const { url } = await response.json()
    if (url) {
      window.location.href = url
    }
  }

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
          <h1 className="mb-8 text-3xl font-bold text-white">Billing Plans</h1>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className="rounded-lg border border-white/5 bg-dark-card p-6"
              >
                <h3 className="mb-2 text-xl font-semibold text-white">{plan.name}</h3>
                <p className="mb-6 text-3xl font-bold text-amber-400">{plan.price}/mo</p>

                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-white/70">
                      <span className="text-amber-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan.id)}
                  className="w-full rounded-lg bg-amber-500 py-2 font-semibold text-black transition-all hover:bg-amber-400"
                >
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
