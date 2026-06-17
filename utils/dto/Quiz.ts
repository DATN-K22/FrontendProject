export type QuestionType = 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'FILL_BLANK'
export interface QuizOption {
  id: string
  quiz_question_id: string
  option_text: string
  is_correct: boolean
  description: string
  reason: string
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question_text: string
  questionType: QuestionType
  quiz_options: QuizOption[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
