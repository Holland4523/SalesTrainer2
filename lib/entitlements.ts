import { supabaseServer } from './supabase-server'

export async function checkEntitlement(
  userId: string,
  action: 'session' | 'score' | 'leaderboard'
): Promise<boolean> {
  try {
    const { data: subscription, error } = await supabaseServer
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', userId)
      .single()

    if (error || !subscription) return false

    if (subscription.status !== 'active') return false

    // Free tier has no access
    if (subscription.tier === 'free') return false

    // Starter tier can only do 5 sessions/month
    if (subscription.tier === 'starter' && action === 'session') {
      const { count } = await supabaseServer
        .from('sessions')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      return (count || 0) < 5
    }

    // Pro and Team have full access
    return subscription.tier === 'pro' || subscription.tier === 'team'
  } catch (error) {
    console.error('Entitlement check error:', error)
    return false
  }
}

export async function getSubscriptionTier(userId: string): Promise<string> {
  try {
    const { data, error } = await supabaseServer
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .single()

    if (error || !data) return 'free'
    return data.tier
  } catch (error) {
    console.error('Get subscription tier error:', error)
    return 'free'
  }
}
