'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  return (
    <div className="w-48 border-r border-white/5 bg-dark-surface p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-lg font-bold text-white">PestPros</h1>
        <p className="text-xs text-white/40">Sales Trainer</p>
      </div>

      <nav className="flex-1 space-y-2">
        <Link
          href="/dashboard"
          className={`block rounded-lg px-4 py-2 text-sm transition-all ${
            isActive('/dashboard')
              ? 'bg-amber-500 text-black font-semibold'
              : 'text-white/70 hover:bg-white/5'
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/practice"
          className={`block rounded-lg px-4 py-2 text-sm transition-all ${
            isActive('/practice')
              ? 'bg-amber-500 text-black font-semibold'
              : 'text-white/70 hover:bg-white/5'
          }`}
        >
          Practice
        </Link>
        <Link
          href="/leaderboard"
          className={`block rounded-lg px-4 py-2 text-sm transition-all ${
            isActive('/leaderboard')
              ? 'bg-amber-500 text-black font-semibold'
              : 'text-white/70 hover:bg-white/5'
          }`}
        >
          Leaderboard
        </Link>
        <Link
          href="/billing"
          className={`block rounded-lg px-4 py-2 text-sm transition-all ${
            isActive('/billing')
              ? 'bg-amber-500 text-black font-semibold'
              : 'text-white/70 hover:bg-white/5'
          }`}
        >
          Billing
        </Link>
      </nav>

      <button
        onClick={handleLogout}
        className="w-full rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition-all hover:bg-white/5"
      >
        Sign Out
      </button>
    </div>
  )
}
