import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from '@/context/userContext'
import { Geist, Geist_Mono } from 'next/font/google'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Learnaide - AI-Powered Online Learning Platform',
  description:
    'Learnaide is an AI-Powered Online Learning Platform with Personalized Course Paths and Virtual Assistant'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning>
        <UserProvider>
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  )
}
