'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChatWidgetProvider } from '@/context/ChatWidgetContext'
import { authUtils } from '@/utils/auth'
import ChatWidget from '@/components/ChatWidget'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [auth, setAuth] = useState<{ token: string | null; userData: any }>({
    token: null,
    userData: null
  })

  useEffect(() => {
    const { token, userData } = authUtils.getAuth()
    setAuth({ token, userData })
    setMounted(true)

    if (!token || !userData) {
      router.replace('/auth/login')
      return
    }

    if (pathname.startsWith('/instructor') && userData.role !== 'teacher') {
      router.replace('/403')
    }
  }, [pathname, router])

  // Server và client đều render giống nhau trước khi mount
  if (!mounted) return null

  if (!auth.token || !auth.userData) return null

  return (
    <ChatWidgetProvider userId={String(auth.userData?.id ?? auth.userData?._id ?? '') || null}>
      <main>{children}</main>
      <ChatWidget />
    </ChatWidgetProvider>
  )
}
