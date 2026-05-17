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

      open: () => set({ isOpen: true }),
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
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const NUMERIC_ID_REGEX = /^\d+$/

const isId = (segment: string) =>
  NUMERIC_ID_REGEX.test(segment) || UUID_REGEX.test(segment)

function detectPageContext(pathname: string): PageContext {
  const segments = pathname.split('/').filter(Boolean)

  const courseIdIndex = segments.findIndex(
    (seg, i) =>
      isId(seg) &&
      (segments[i - 1] === 'course' || segments[i - 1] === 'courses')
  )

  if (courseIdIndex === -1) return { type: 'general' }

  const courseId = segments[courseIdIndex]
  const next = segments[courseIdIndex + 1]

  if (!next) return { type: 'course', courseId }

  if (next === 'lesson' || next === 'lessons') {
    const lessonId = segments[courseIdIndex + 2]
    if (lessonId && isId(lessonId)) return { type: 'lesson', courseId, lessonId }
    return { type: 'course', courseId }
  }

  const nonLessonRouteSegments = new Set([
    'quiz', 'quizzes', 'lab', 'labs',
    'payment', 'overview', 'start', 'confirm',
  ])

  if (isId(next)) return { type: 'lesson', courseId, lessonId: next }
  if (!nonLessonRouteSegments.has(next)) return { type: 'lesson', courseId, lessonId: next }

  return { type: 'course', courseId }
}