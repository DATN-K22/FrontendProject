import type { Metadata } from 'next'
import './globals.css'
import '@calendarjs/ce/dist/style.css'
import Providers from './providers'
import { LoadingProvider } from '@/components/Loading'
import { AlertProvider } from '@/components/Alert'
import ConditionalLayout from '@/components/ConditionalLayout'
import { Geist } from 'next/font/google'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Learnaide - AI-Powered Online Learning Platform',
  description:
    'Learnaide is an AI-Powered Online Learning Platform with Personalized Course Paths and Virtual Assistant'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={cn('font-sans', geist.variable)} >
      <body>
        <Providers>
          <LoadingProvider>
            <AlertProvider>
              <ConditionalLayout>{children}</ConditionalLayout>
            </AlertProvider>
          </LoadingProvider>
        </Providers>
      </body>
    </html>
  )
}
