import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from '@/context/userContext'

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
