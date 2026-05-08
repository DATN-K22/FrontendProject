'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { usePathname } from 'next/navigation'
import { createContext, useContext } from 'react'

// ─────────────────────────────────────────
// Zustand store — persist qua F5
// ─────────────────────────────────────────
interface ChatWidgetStore {
  isOpen: boolean
  contextId: string | null
  selectedTimezone: string

  open: () => void
  close: () => void
  setContextId: (id: string | null) => void
  setSelectedTimezone: (timezone: string) => void
}

const getBrowserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Etc/UTC'
  } catch {
    return 'Etc/UTC'
  }
}

const useChatStore = create<ChatWidgetStore>()(
  persist(
    (set) => ({
      isOpen: false,
      contextId: null as string | null,
      selectedTimezone: getBrowserTimezone(),

      open:  () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setContextId: (id: string | null) => 
        set({ contextId: id }),
      setSelectedTimezone: (timezone: string) =>
        set({ selectedTimezone: timezone }),
    }),
    {
      name: 'chat-widget',
      // Chỉ persist những field thật sự cần
      partialize: (s) => ({
        isOpen: s.isOpen,
        contextId: s.contextId,
        selectedTimezone: s.selectedTimezone,
      })
    }
  )
)

// ─────────────────────────────────────────
// Context — truyền userId + pageContext
// ─────────────────────────────────────────
interface ChatWidgetContextValue {
  userId: string | null
  pageContext: PageContext
  store: ChatWidgetStore
}

interface PageContext {
    type: 'lesson' | 'course' | 'general'
    courseId?: string
    lessonId?: string
}

const chatWidgetContext = createContext<ChatWidgetContextValue | undefined>(undefined)

export const ChatWidgetProvider: React.FC<{ userId: string | null, children: React.ReactNode }> = ({ userId, children }) => {
  const store = useChatStore((state) => state)
  const pathname = usePathname()

  const pageContext = detectPageContext(pathname)

  return (
    <chatWidgetContext.Provider value={{ userId, pageContext, store }}>
      {children}
    </chatWidgetContext.Provider>
  )
}

export const useChatWidget = () => useContext(chatWidgetContext)

// ─────────────────────────────────────────
// Helper
// ─────────────────────────────────────────
function detectPageContext(pathname: string): PageContext {
  const segments = pathname.split('/').filter(Boolean)
  const courseSegmentIndex = segments.findIndex(
    (segment) => segment === 'course' || segment === 'courses'
  )

  if (courseSegmentIndex === -1) return { type: 'general' }

  const courseId = segments[courseSegmentIndex + 1]
  if (!courseId) return { type: 'general' }

  const firstSegmentAfterCourseId = segments[courseSegmentIndex + 2]
  if (!firstSegmentAfterCourseId) {
    return { type: 'course', courseId }
  }

  if (
    firstSegmentAfterCourseId === 'lesson' ||
    firstSegmentAfterCourseId === 'lessons'
  ) {
    const lessonId = segments[courseSegmentIndex + 3]
    if (lessonId) return { type: 'lesson', courseId, lessonId }
    return { type: 'course', courseId }
  }

  const nonLessonRouteSegments = new Set([
    'quiz',
    'quizzes',
    'lab',
    'labs',
    'payment',
    'overview',
    'start',
    'confirm',
  ])

  if (!nonLessonRouteSegments.has(firstSegmentAfterCourseId)) {
    return {
      type: 'lesson',
      courseId,
      lessonId: firstSegmentAfterCourseId,
    }
  }

  return { type: 'course', courseId }
}
