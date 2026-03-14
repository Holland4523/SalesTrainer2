import Stripe from 'stripe'

function getStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable')
  }
  return new Stripe(apiKey)
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
