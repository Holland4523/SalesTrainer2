import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance
  
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable')
  }
  
  stripeInstance = new Stripe(apiKey)
  return stripeInstance
}

// Proxy that lazily initializes Stripe
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 2900,
    currency: 'usd',
    interval: 'month',
    features: ['5 sessions/month', 'Basic scoring', 'Email support'],
  },
  pro: {
    name: 'Pro',
    price: 9900,
    currency: 'usd',
    interval: 'month',
    features: ['Unlimited sessions', 'Advanced analytics', 'Priority support', 'Team leaderboard'],
  },
  team: {
    name: 'Team',
    price: 29900,
    currency: 'usd',
    interval: 'month',
    features: ['Unlimited everything', '5 team seats', 'Manager dashboard', 'Custom scenarios'],
  },
}
