import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: user, error: authError } = await supabaseServer.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get subscription
    const { data: subscription, error } = await supabaseServer
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .single()

    if (error || !subscription) {
      return NextResponse.json({
        tier: 'free',
        status: 'inactive',
      })
    }

    return NextResponse.json({
      tier: subscription.tier || 'free',
      status: subscription.status || 'inactive',
    })
  } catch (error) {
    console.error('Entitlement check error:', error)
    return NextResponse.json({ error: 'Failed to check entitlement' }, { status: 500 })
  }
}
