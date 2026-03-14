import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 })
    }

    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle subscription events
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as any

      const { data: customer } = await stripe.customers.retrieve(subscription.customer as string)
      const email = (customer as any).email

      if (!email) {
        console.error('No email found for customer')
        return NextResponse.json({ error: 'Customer email not found' }, { status: 400 })
      }

      // Get the plan ID from metadata
      const planId = subscription.metadata?.planId || 'pro'

      // Update subscription in Supabase
      const { error } = await supabaseServer
        .from('subscriptions')
        .upsert({
          user_email: email,
          tier: planId,
          status: 'active',
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
        })

      if (error) {
        console.error('Subscription update error:', error)
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any

      const { error } = await supabaseServer
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id)

      if (error) {
        console.error('Subscription cancellation error:', error)
        return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
