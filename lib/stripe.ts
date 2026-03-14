import Stripe from 'stripe'

function getStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable')
  }
  return new Stripe(apiKey, {
    apiVersion: '2024-12-18.acacia',
  })
}

export const stripe = {
  get instance() {
    return getStripe()
  },
  customers: {
    list: (...args: Parameters<Stripe['customers']['list']>) => getStripe().customers.list(...args),
    create: (...args: Parameters<Stripe['customers']['create']>) => getStripe().customers.create(...args),
    retrieve: (...args: Parameters<Stripe['customers']['retrieve']>) => getStripe().customers.retrieve(...args),
  },
  checkout: {
    sessions: {
      create: (...args: Parameters<Stripe['checkout']['sessions']['create']>) => getStripe().checkout.sessions.create(...args),
    },
  },
  webhooks: {
    constructEvent: (payload: string, sig: string, secret: string) => getStripe().webhooks.constructEvent(payload, sig, secret),
  },
}

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
