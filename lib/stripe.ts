import Stripe from 'stripe'

const apiKey = process.env.STRIPE_SECRET_KEY
if (!apiKey) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

export const stripe = new Stripe(apiKey, {
  apiVersion: '2024-12-15',
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
