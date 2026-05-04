import { useState, useCallback, useEffect } from 'react'
import api from '@/api/api'
import { QuizQuestion, QuizOption, QuestionType } from '@/utils/dto/Quiz'
import { ApiResponse } from '@/utils/dto/ApiResponse'

/* =========================
   Types
========================= */

export type CreateQuestionPayload = {
  question_text: string
  questionType: QuestionType
  options?: { option_text: string; is_correct: boolean; description: string; reason: string }[]
}

export type UpdateQuestionPayload = {
  question_text?: string
  questionType?: QuestionType
}

export type OptionPayload = {
  option_text: string
  is_correct: boolean
  description: string
  reason: string
}

export type UpdateOptionPayload = Partial<OptionPayload>

export type ToastSeverity = 'success' | 'error'

export interface Toast {
  msg: string
  severity: ToastSeverity
}

/* =========================
   Helpers
========================= */

async function handleApi<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await promise
  if (!res.data.success) {
    throw new Error(res.data.message || 'Request failed')
  }
  return res.data.data as T
}

function useAsync() {
  const run = async <T>(fn: () => Promise<T>): Promise<T | null> => {
    try {
      return await fn()
    } catch {
      return null
    }
  }

  return { run }
}

/* =========================
   Hook
========================= */

export function useQuiz(quizId: string) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  const { run } = useAsync()

  const showToast = useCallback((msg: string, severity: ToastSeverity = 'success') => {
    setToast({ msg, severity })
  }, [])

  const hideToast = useCallback(() => setToast(null), [])

  /* =========================
     Fetch
  ========================= */

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    setLoadError(null)

    const data = await run(() => handleApi<QuizQuestion[]>(api.get(`/courses/quizzes/${quizId}/questions`)))

    // `run` returns `null` when the request failed. An empty array is a valid
    // successful response and should not be treated as an error. Preserve error
    // state only when `data === null`.
    if (data === null) {
      const msg = 'Failed to load questions'
      setLoadError(msg)
      showToast(msg, 'error')
    } else {
      setQuestions(data ?? [])
    }

    setLoading(false)
  }, [quizId, showToast])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  /* =========================
     Question
  ========================= */

  const addQuestion = useCallback(
    async (payload: CreateQuestionPayload) => {
      const data = await run(() => handleApi<QuizQuestion>(api.post(`/courses/quizzes/${quizId}/questions`, payload)))

      if (!data) {
        showToast('Failed to create question', 'error')
        return null
      }

      setQuestions((prev) => [...prev, data])
      showToast('Question created')
      return data
    },
    [quizId, showToast]
  )

  const updateQuestion = useCallback(
    async (questionId: string, payload: UpdateQuestionPayload) => {
      const snapshot = questions

      setQuestions((qs) => qs.map((q) => (q.id === questionId ? { ...q, ...payload } : q)))

      const ok = await run(() =>
        handleApi<QuizQuestion>(api.patch(`/courses/quizzes/questions/${questionId}`, payload))
      )

      if (!ok) {
        setQuestions(snapshot)
        showToast('Failed to update question', 'error')
        return false
      }

      showToast('Question updated')
      return true
    },
    [questions, showToast]
  )

  const removeQuestion = useCallback(
    async (questionId: string) => {
      const snapshot = questions
      setQuestions((qs) => qs.filter((q) => q.id !== questionId))

      const ok = await run(() =>
        handleApi<{ deleted: boolean }>(api.delete(`/courses/quizzes/questions/${questionId}`))
      )

      if (!ok) {
        setQuestions(snapshot)
        showToast('Failed to delete question', 'error')
        return false
      }

      showToast('Question deleted')
      return true
    },
    [questions, showToast]
  )

  /* =========================
     Option
  ========================= */

  const addOption = useCallback(
    async (questionId: string, payload: OptionPayload) => {
      const data = await run(() =>
        handleApi<QuizOption>(api.post(`/courses/quizzes/questions/${questionId}/options`, payload))
      )

      if (!data) {
        showToast('Failed to add option', 'error')
        return null
      }

      setQuestions((qs) => qs.map((q) => (q.id === questionId ? { ...q, quiz_options: [...q.quiz_options, data] } : q)))

      showToast('Option added')
      return data
    },
    [showToast]
  )

  const updateOption = useCallback(
    async (
      optionId: string,
      payload: UpdateOptionPayload,
      optimisticPatch?: (prev: QuizQuestion[]) => QuizQuestion[]
    ) => {
      const snapshot = questions

      if (optimisticPatch) {
        setQuestions((prev) => optimisticPatch(prev))
      }

      const ok = await run(() => handleApi<QuizOption>(api.patch(`/courses/quizzes/options/${optionId}`, payload)))

      if (!ok) {
        setQuestions(snapshot)
        showToast('Failed to update option', 'error')
        return false
      }

      return true
    },
    [questions, showToast]
  )

  const removeOption = useCallback(
    async (optionId: string, optimisticPatch?: (prev: QuizQuestion[]) => QuizQuestion[]) => {
      const snapshot = questions

      if (optimisticPatch) {
        setQuestions((prev) => optimisticPatch(prev))
      }

      const ok = await run(() => handleApi<{ deleted: boolean }>(api.delete(`/courses/quizzes/options/${optionId}`)))

      if (!ok) {
        setQuestions(snapshot)
        showToast('Failed to delete option', 'error')
        return false
      }

      showToast('Option deleted')
      return true
    },
    [questions, showToast]
  )

  /* =========================
     Local patch
  ========================= */

  const patchQuestion = useCallback((updated: QuizQuestion) => {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
  }, [])

  return {
    questions,
    loading,
    loadError,
    toast,
    hideToast,
    fetchQuestions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    addOption,
    updateOption,
    removeOption,
    patchQuestion
  }
}
