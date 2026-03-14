'use client'

import Link from 'next/link'

export default function SubscriptionGate() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-12">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-3xl font-bold text-white">Upgrade Required</h1>
        <p className="mb-6 text-white/60">
          Start a practice session to improve your sales skills. Choose a plan below to get started.
        </p>

        <Link
          href="/billing"
          className="inline-block rounded-lg bg-amber-500 px-6 py-3 font-semibold text-black transition-all hover:bg-amber-400"
        >
          View Plans
        </Link>
      </div>
    </div>
  )
}
