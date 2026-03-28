import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import { LoadingProvider } from '@/components/loading'
import { AlertProvider } from '@/components/alert'
import './globals.css'
import '@calendarjs/ce/dist/style.css'

export const metadata: Metadata = {
  title: 'Learnaide - AI-Powered Online Learning Platform',
  description:
    'Learnaide is an AI-Powered Online Learning Platform with Personalized Course Paths and Virtual Assistant'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning>
        <Providers>
          <LoadingProvider>
            <AlertProvider>
              <main>{children}</main>
            </AlertProvider>
          </LoadingProvider>
        </Providers>
      </body>
    </html>
  )
}
