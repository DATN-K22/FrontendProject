'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { useUser } from '@/context/userContext'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const isInstructor = pathname.startsWith('/authenticated/instructor')

  // useEffect(() => {
  //   if (!user) {
  //     router.replace('/auth/login')
  //     return
  //   }
  //   console.log('AuthenticatedLayout: User role is', user.role, 'and pathname is', pathname)
  //   if (pathname.startsWith('/instructor') && user.role !== 'instructor') {
  //     router.replace('/403')
  //     return
  //   }
  // }, [user, pathname])

  return (
    <>
      {!isInstructor && <Header />}
      <main>{children}</main>
      {!isInstructor && <Footer />}
    </>
  )
}
