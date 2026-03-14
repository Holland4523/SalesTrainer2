import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

let serverInstance: SupabaseClient | null = null

export function getSupabaseServer(): SupabaseClient {
  if (serverInstance) return serverInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  serverInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return serverInstance
}

// Use Proxy to lazily initialize while preserving types
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabaseServer()[prop as keyof SupabaseClient]
  },
})

export async function getServerSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-token')?.value

  if (!token) return null

  const { data, error } = await supabaseServer.auth.getUser(token)
  if (error) return null

  return data.user
}
