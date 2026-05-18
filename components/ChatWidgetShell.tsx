'use client'

import { useEffect, useState } from 'react'
import { ChatWidgetProvider } from '@/context/ChatWidgetContext'
import ChatWidget from '@/components/ChatWidget'
import { authUtils } from '@/utils/auth'

export default function ChatWidgetShell({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const { userData } = authUtils.getAuth()
    const id = userData?.id ?? userData?._id ?? null
    setUserId(id ? String(id) : null)
  }, [])

  return (
    <ChatWidgetProvider userId={userId}>
      {children}
      {userId && <ChatWidget />}
    </ChatWidgetProvider>
  )
}
