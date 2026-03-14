import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

let serverInstance: SupabaseClient | null = null

function getSupabaseServer() {
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

export const supabaseServer = {
  get auth() {
    return getSupabaseServer().auth
  },
  from: (table: string) => getSupabaseServer().from(table),
}

export async function getServerSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-token')?.value

  if (!token) return null

  const { data, error } = await supabaseServer.auth.getUser(token)
  if (error) return null

  return data.user
}
