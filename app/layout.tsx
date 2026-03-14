import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PestPros AI Sales Trainer',
  description: 'Master sales skills with AI-powered roleplay training',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
