'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckIcon, ListIcon, MessageCircleIcon, PlusIcon, XCircleIcon, XIcon } from 'lucide-react'
import type { ChatStatus } from 'ai'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton
} from '@/components/ai-elements/conversation'
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools
} from '@/components/ai-elements/prompt-input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useChatWidget } from '@/context/ChatWidgetContext'
import api from '@/api/api'
import { getAllTimezones, getTimezone } from 'countries-and-timezones'

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskState = 'completed' | 'input-required' | 'working' | 'canceled' | 'failed'

type ScheduleAction =
  | 'add'
  | 'update'
  | 'delete'
  | 'modify-this-and-following'
  | 'modify-this-only'
  | 'add-exception-date'

interface ScheduleChange {
  action: ScheduleAction
  title?: string
  time_start?: string
  time_end?: string
  timezone?: string
  rrule_string?: string
  description?: string
  location?: string
  eventId?: string
  exception_date?: string
  reason?: string
}

interface PendingApproval {
  functionCallId: string
  functionName?: string
  approvalId?: string
  proposedChanges: ScheduleChange[]
}

function normalizeProposedChanges(value: unknown): ScheduleChange[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is ScheduleChange => !!item && typeof item === 'object' && 'action' in item)
  }

  if (value && typeof value === 'object') {
    if ('proposed_changes' in value) {
      return normalizeProposedChanges((value as { proposed_changes?: unknown }).proposed_changes)
    }

    if ('changes' in value) {
      return normalizeProposedChanges((value as { changes?: unknown }).changes)
    }

    if ('action' in value) {
      return [value as ScheduleChange]
    }
  }

  return []
}

type Part =
  | { kind: 'text'; text: string }
  | {
      kind: 'data'
      data: {
        id: string
        name: string
        args?: Record<string, unknown>
        response?: Record<string, unknown>
      }
      metadata: { adk_type: string; adk_is_long_running?: boolean }
    }

interface A2AMessage {
  kind: 'message'
  messageId: string
  role: 'user' | 'agent'
  parts: Part[]
  contextId?: string
  taskId?: string
}

interface OrchestratorResponse {
  id: string
  jsonrpc: '2.0'
  result?: {
    id: string
    kind: 'task'
    contextId: string
    artifacts?: Array<{
      artifactId?: string
      parts: Array<{ kind: 'text'; text: string }>
    }>
    history: A2AMessage[]
    status: {
      state: TaskState
      timestamp: string
      message?: A2AMessage
    }
    metadata: {
      adk_app_name: string
      adk_user_id: string
      adk_session_id: string
      adk_author: string
      adk_usage_metadata: {
        cachedContentTokenCount: number
        candidatesTokenCount: number
        promptTokenCount: number
        totalTokenCount: number
      }
    }
  }
  error?: { code: number; message: string }
}

// Simplified shape for the UI layer
interface ParsedResponse {
  agentText: string
  contextId: string | null
  taskId: string | null
  state: TaskState
  pendingApproval: PendingApproval | null
}

// Chat message shown in the UI
type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; text: string; pendingApproval?: PendingApproval }

interface ConversationSummary {
  sessionId: string
  title: string
  preview: string
  updatedAt?: string
  contextId?: string
  taskId?: string
  messages: ChatMessage[]
}

interface SessionListItem {
  id?: string
  session_id?: string
  state?: Record<string, unknown>
  last_update_time?: number
  updated_at?: string
}

interface TimezoneOption {
  value: string
  label: string
  offsetMinutes: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const randomId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

const FALLBACK_WELCOME = 'Hello! I can help with courses, schedules, and course content. What do you want to do today?'

function isRequestCanceled(error: unknown): boolean {
  const maybeError = error as { code?: string; name?: string }
  return (
    maybeError?.code === 'ERR_CANCELED' || maybeError?.name === 'CanceledError' || maybeError?.name === 'AbortError'
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object'
}

function extractMessageText(parts: unknown): string {
  if (!Array.isArray(parts)) return ''
  return parts
    .filter((part): part is { kind?: unknown; text?: unknown } => isRecord(part))
    .filter((part) => part.kind === 'text' && typeof part.text === 'string')
    .map((part) => String(part.text).trim())
    .filter(Boolean)
    .join('\n\n')
}

function parseTimestampToIso(value: unknown): string | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined

  // API returns unix seconds (may include fractional part).
  const ms = value < 1_000_000_000_000 ? value * 1000 : value
  const date = new Date(ms)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function parsePendingApproval(value: unknown): PendingApproval | undefined {
  if (!isRecord(value)) return undefined

  const functionCallId =
    typeof value.functionCallId === 'string'
      ? value.functionCallId
      : typeof value.function_call_id === 'string'
        ? value.function_call_id
        : null

  if (!functionCallId) return undefined

  const approvalId =
    typeof value.approvalId === 'string'
      ? value.approvalId
      : typeof value.approval_id === 'string'
        ? value.approval_id
        : undefined

  const functionName =
    typeof value.functionName === 'string'
      ? value.functionName
      : typeof value.function_name === 'string'
        ? value.function_name
        : undefined

  return {
    functionCallId,
    ...(functionName ? { functionName } : {}),
    ...(approvalId ? { approvalId } : {}),
    proposedChanges: normalizeProposedChanges(value.proposed_changes)
  }
}

function extractApprovalIdFromParts(parts: Part[]): string | undefined {
  for (const part of parts) {
    if (part.kind !== 'data') continue
    if (part.data.name !== 'request_schedule_approval') continue
    if (!isRecord(part.data.response)) continue

    const response = part.data.response
    const approvalId =
      typeof response.approval_id === 'string'
        ? response.approval_id
        : typeof response.approvalId === 'string'
          ? response.approvalId
          : undefined

    if (approvalId) return approvalId
  }

  const text = parts
    .filter((part): part is { kind: 'text'; text: string } => part.kind === 'text')
    .map((part) => part.text)
    .join('\n')
  const textMatch = text.match(/approval\s*id\s*:\s*([a-z0-9-]+)/i)
  if (textMatch?.[1]) return textMatch[1]

  return undefined
}

interface ParsedHistoryPayload {
  sessionId: string | null
  contextId: string | null
  taskId: string | null
  updatedAt?: string
  messages: ChatMessage[]
}

function parseHistoryPayload(payload: unknown): ParsedHistoryPayload {
  const sessionId = isRecord(payload) ? getSessionId(payload) : null
  const history = getHistoryArray(payload)

  let latestContextId: string | null = null
  let latestTaskId: string | null = null
  let latestUpdatedAt: string | undefined

  const rawMessages = history
    .filter((entry): entry is Record<string, unknown> => isRecord(entry))
    .map((entry) => {
      const role =
        entry.role === 'user' ? 'user' : entry.role === 'assistant' || entry.role === 'agent' ? 'assistant' : null
      if (!role) return null

      const textFromChatHistory = typeof entry.text === 'string' ? entry.text.trim() : ''
      const textFromA2A = extractMessageText(entry.parts)
      const text = textFromChatHistory || textFromA2A
      if (!text) return null

      const contextFromItem =
        typeof entry.context_id === 'string'
          ? entry.context_id
          : typeof entry.contextId === 'string'
            ? entry.contextId
            : null
      if (contextFromItem) latestContextId = contextFromItem

      const taskFromItem =
        typeof entry.task_id === 'string' ? entry.task_id : typeof entry.taskId === 'string' ? entry.taskId : null
      const stateFromItem = typeof entry.state === 'string' ? entry.state : null
      if (taskFromItem && stateFromItem === 'input-required') {
        latestTaskId = taskFromItem
      }

      const updatedAtFromItem =
        typeof entry.updated_at === 'string'
          ? entry.updated_at
          : typeof entry.updatedAt === 'string'
            ? entry.updatedAt
            : parseTimestampToIso(entry.timestamp)
      if (updatedAtFromItem) latestUpdatedAt = updatedAtFromItem

      const pendingApproval = parsePendingApproval(entry.pending_approval)

      return {
        id:
          typeof entry.id === 'string' ? entry.id : typeof entry.messageId === 'string' ? entry.messageId : randomId(),
        role,
        text,
        ...(role === 'assistant' && pendingApproval ? { pendingApproval } : {})
      } as ChatMessage
    })
    .filter((msg): msg is ChatMessage => !!msg)

  // Filter duplicate assistant messages caused by ADK sub-agent events
  // leaking into the root session — keep only the last assistant message
  // in each consecutive assistant block (root agent's final response).
  const messages = rawMessages.filter((msg, index, arr) => {
    if (msg.role !== 'assistant') return true
    // If this assistant message has a pending approval, always keep it
    if (msg.pendingApproval) return true
    // Skip if the next message is also an assistant (this is a sub-agent intermediate response)
    const next = arr[index + 1]
    return !(next && next.role === 'assistant')
  })

  return {
    sessionId,
    contextId: latestContextId,
    taskId: latestTaskId,
    updatedAt: latestUpdatedAt,
    messages
  }
}
function getHistoryArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  if (!isRecord(payload)) return []

  if (Array.isArray(payload.chat_history)) return payload.chat_history
  if (Array.isArray(payload.history)) return payload.history
  if (isRecord(payload.result) && Array.isArray(payload.result.history)) return payload.result.history
  if (isRecord(payload.data) && Array.isArray(payload.data.history)) return payload.data.history
  if (isRecord(payload.data) && Array.isArray(payload.data.chat_history)) return payload.data.chat_history
  if (isRecord(payload.conversation) && Array.isArray(payload.conversation.history)) {
    return payload.conversation.history
  }

  return []
}

function getPossibleConversationList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  if (!isRecord(payload)) return []

  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.sessions)) return payload.sessions
  if (Array.isArray(payload.conversations)) return payload.conversations
  if (isRecord(payload.data) && Array.isArray(payload.data.items)) return payload.data.items
  if (isRecord(payload.data) && Array.isArray(payload.data.sessions)) return payload.data.sessions
  if (isRecord(payload.data) && Array.isArray(payload.data.conversations)) {
    return payload.data.conversations
  }

  return []
}

function getSessionId(value: Record<string, unknown>): string | null {
  const raw = value.session_id ?? value.sessionId ?? value.context_id ?? value.contextId ?? value.id
  return typeof raw === 'string' && raw.trim() ? raw : null
}

function getSessionIdFromSessionStateResponse(payload: unknown): string | null {
  if (!isRecord(payload)) return null

  const direct = getSessionId(payload)
  if (direct) return direct

  if (isRecord(payload.data)) {
    const fromData = getSessionId(payload.data)
    if (fromData) return fromData
  }

  if (isRecord(payload.result)) {
    const fromResult = getSessionId(payload.result)
    if (fromResult) return fromResult
  }

  return null
}

function buildSummaryFromMessages(
  sessionId: string,
  messages: ChatMessage[],
  updatedAt?: string,
  contextId?: string,
  taskId?: string
): ConversationSummary {
  const firstUser = messages.find((m) => m.role === 'user')?.text ?? 'New chat'
  const lastText = messages[messages.length - 1]?.text ?? ''

  return {
    sessionId,
    title: firstUser.length > 54 ? `${firstUser.slice(0, 54)}...` : firstUser,
    preview: lastText.length > 72 ? `${lastText.slice(0, 72)}...` : lastText,
    updatedAt,
    contextId,
    taskId,
    messages
  }
}

function buildSummaryFromSession(item: SessionListItem): ConversationSummary | null {
  const sessionId = typeof item.id === 'string' ? item.id : typeof item.session_id === 'string' ? item.session_id : null

  if (!sessionId) return null

  const state = isRecord(item.state) ? item.state : null
  const titleFromState = state && typeof state.conversation_title === 'string' ? state.conversation_title.trim() : ''

  const updatedAt = typeof item.updated_at === 'string' ? item.updated_at : parseTimestampToIso(item.last_update_time)

  return {
    sessionId,
    title: titleFromState || 'New chat',
    preview: '',
    updatedAt,
    contextId: sessionId,
    taskId: undefined,
    messages: []
  }
}

function formatRelativeDate(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const isSameDay = date.toDateString() === now.toDateString()
  if (isSameDay) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }

  return date.toLocaleDateString()
}

function groupLabelFromDate(value?: string): 'Today' | 'Yesterday' | 'Earlier' {
  if (!value) return 'Earlier'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Earlier'

  const now = new Date()
  if (date.toDateString() === now.toDateString()) return 'Today'

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return 'Earlier'
}

function formatGmtOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absoluteMinutes = Math.abs(offsetMinutes)
  const hours = Math.floor(absoluteMinutes / 60)
  const minutes = absoluteMinutes % 60
  if (minutes === 0) {
    return `GMT${sign}${hours}`
  }
  return `GMT${sign}${hours}:${minutes.toString().padStart(2, '0')}`
}

function toReadableLocation(timezoneName: string): string {
  return timezoneName.replace(/_/g, ' ')
}

function parseResponse(raw: OrchestratorResponse): ParsedResponse {
  if (raw.error) {
    throw new Error(`A2A error ${raw.error.code}: ${raw.error.message}`)
  }

  const result = raw.result

  // Lấy text part cuối cùng trong toàn bộ artifacts
  const artifactText = (() => {
    const allTextParts = (result?.artifacts ?? [])
      .flatMap((a) => a.parts)
      .filter((p) => p.kind === 'text')
      .map((p) => p.text.trim())
      .filter(Boolean)

    return allTextParts.at(-1) ?? ''
  })()

  // Lấy text part cuối cùng trong toàn bộ history agent messages
  const historyText = (() => {
    const allTextParts = (result?.history ?? [])
      .filter((m) => m.role === 'agent')
      .flatMap((m) => m.parts)
      .filter((p): p is { kind: 'text'; text: string } => p.kind === 'text')
      .map((p) => p.text.trim())
      .filter(Boolean)

    return allTextParts.at(-1) ?? ''
  })()

  const agentText = artifactText || historyText

  // 2. Extract pending approval when input-required
  let pendingApproval: PendingApproval | null = null
  if (result?.status.state === 'input-required' && result.status.message) {
    const suspendedPart = result.status.message.parts.find(
      (p): p is Extract<Part, { kind: 'data' }> => p.kind === 'data' && p.metadata.adk_is_long_running === true
    )
    if (suspendedPart && 'args' in suspendedPart.data) {
      const args = suspendedPart.data.args as { proposed_changes?: unknown }
      const approvalId = extractApprovalIdFromParts(result.status.message.parts)
      pendingApproval = {
        functionCallId: suspendedPart.data.id,
        functionName: suspendedPart.data.name,
        ...(approvalId ? { approvalId } : {}),
        proposedChanges: normalizeProposedChanges(args?.proposed_changes)
      }
    }
  }

  return {
    agentText,
    contextId: result?.contextId ?? null,
    taskId: result?.id ?? null,
    state: result?.status.state ?? 'completed',
    pendingApproval
  }
}

// ─── Approval Card ────────────────────────────────────────────────────────────

function ApprovalCard({
  approval,
  onApprove,
  onReject,
  disabled
}: {
  approval: PendingApproval
  onApprove: () => void
  onReject: () => void
  disabled: boolean
}) {
  return (
    <div className='mt-3 rounded-xl border border-[#e8e4d9] bg-white p-4 text-sm shadow-sm'>
      <p className='mb-2 font-semibold text-[#252641]'>Proposed changes</p>
      <ul className='mb-4 space-y-1.5'>
        {(Array.isArray(approval.proposedChanges) ? approval.proposedChanges : []).map((c, i) => (
          <li key={i} className='flex items-start gap-2 text-[#4a4b6a]'>
            <span className='mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#FFD600]/20 text-[10px] font-bold text-[#252641]'>
              {i + 1}
            </span>
            <span>
              <span className='font-semibold capitalize text-[#252641]'>{c.action}</span>
              {c.title ? ` — ${c.title}` : ''}
              {c.time_start ? ` · ${c.time_start.slice(0, 16).replace('T', ' ')}` : ''}
              {c.rrule_string ? ` · ${c.rrule_string}` : ''}
            </span>
          </li>
        ))}
      </ul>
      <div className='flex gap-2'>
        <Button
          className='h-8 gap-1.5 rounded-lg bg-[#252641] px-3 text-xs text-white transition-opacity hover:opacity-80'
          disabled={disabled}
          onClick={onApprove}
          size='sm'
          variant='default'
        >
          <CheckIcon className='size-3' /> Approve
        </Button>
        <Button
          className='h-8 gap-1.5 rounded-lg border border-[#e0ddd5] px-3 text-xs text-[#252641] transition-colors hover:bg-[#f5f4f0]'
          disabled={disabled}
          onClick={onReject}
          size='sm'
          variant='outline'
        >
          <XCircleIcon className='size-3' /> Reject
        </Button>
      </div>
    </div>
  )
}

// ─── Main Widget ───────────────────────────────────────────────────────────────

type ChatWidgetProps = {
  endpoint?: string
  tenantId?: string
}

export default function ChatWidget({
  endpoint = process.env.NEXT_PUBLIC_ORCHESTRATOR_ENDPOINT || 'orchestrator',
  tenantId = ''
}: ChatWidgetProps) {
  const chatWidget = useChatWidget()

  const [localOpen, setLocalOpen] = useState(false)
  const [localContextId, setLocalContextId] = useState<string | null>(null)
  const [localTaskId, setLocalTaskId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ChatStatus>('ready')
  const [composerText, setComposerText] = useState('')
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<ConversationSummary[]>([])
  const [localSelectedTimezone, setLocalSelectedTimezone] = useState('Etc/UTC')

  const lastRestoredContextRef = useRef<string | null>(null)
  const requestInFlightRef = useRef(false)

  const isOpen = chatWidget?.store.isOpen ?? localOpen
  const contextId = chatWidget?.store.contextId ?? localContextId
  const courseIdFromContext = chatWidget?.pageContext.courseId ?? null

  const timezoneOptions = useMemo<TimezoneOption[]>(() => {
    try {
      const zones = Object.entries(getAllTimezones())
      return zones
        .sort((left, right) => {
          const offsetDiff = left[1].utcOffset - right[1].utcOffset
          if (offsetDiff !== 0) return offsetDiff
          return left[0].localeCompare(right[0])
        })
        .map(([timezoneName, timezoneInfo]) => ({
          value: timezoneName,
          label: `${formatGmtOffset(timezoneInfo.utcOffset)} ${toReadableLocation(timezoneName)}`.trim(),
          offsetMinutes: timezoneInfo.utcOffset
        }))
    } catch {
      return [
        { value: 'Etc/UTC', label: 'GMT+0 UTC', offsetMinutes: 0 },
        { value: 'Asia/Ho_Chi_Minh', label: 'GMT+7 Asia/Ho Chi Minh', offsetMinutes: 420 }
      ]
    }
  }, [])

  const defaultTimezone = useMemo(() => {
    const detectedName = Intl.DateTimeFormat().resolvedOptions().timeZone
    const matchByName = timezoneOptions.find((option) => option.value === detectedName)
    if (matchByName) return matchByName.value

    const detectedOffset = -new Date().getTimezoneOffset()
    const matchByOffset = timezoneOptions.find((option) => option.offsetMinutes === detectedOffset)
    if (matchByOffset) return matchByOffset.value

    const detectedTz = getTimezone(detectedName)
    if (detectedTz) {
      const fallbackByOffset = timezoneOptions.find((option) => option.offsetMinutes === detectedTz.utcOffset)
      if (fallbackByOffset) return fallbackByOffset.value
    }

    return timezoneOptions[0]?.value ?? 'Etc/UTC'
  }, [timezoneOptions])
  const selectedTimezone = chatWidget?.store.selectedTimezone ?? localSelectedTimezone
  const setSelectedTimezone = useCallback(
    (timezone: string) => {
      if (chatWidget) {
        chatWidget.store.setSelectedTimezone(timezone)
        return
      }
      setLocalSelectedTimezone(timezone)
    },
    [chatWidget]
  )
  const tenantIdToUse = tenantId || (chatWidget ? 'course_' + chatWidget.pageContext.courseId : null) || 'course_21'

  useEffect(() => {
    if (timezoneOptions.length === 0) return

    const hasSelectedTimezone = timezoneOptions.some((option) => option.value === selectedTimezone)
    if (hasSelectedTimezone) return

    setSelectedTimezone(defaultTimezone)
  }, [defaultTimezone, selectedTimezone, setSelectedTimezone, timezoneOptions])

  const openWidget = useCallback(() => {
    if (chatWidget) {
      chatWidget.store.open()
      return
    }
    setLocalOpen(true)
  }, [chatWidget])

  const closeWidget = useCallback(() => {
    if (chatWidget) {
      chatWidget.store.close()
      setShowHistoryPanel(false)
      return
    }
    setShowHistoryPanel(false)
    setLocalOpen(false)
  }, [chatWidget])

  const saveContext = useCallback(
    (nextContextId: string | null, nextTaskId: string | null) => {
      if (chatWidget) chatWidget.store.setContextId(nextContextId)
      else setLocalContextId(nextContextId)
      setLocalTaskId(nextTaskId)
    },
    [chatWidget]
  )

  const canSubmit = useMemo(() => status === 'ready' || status === 'error', [status])

  const historyEndpoint = useMemo(() => `${endpoint.replace(/\/$/, '')}/chat_history`, [endpoint])

  const conversationsEndpoint = useMemo(() => `${endpoint.replace(/\/$/, '')}/sessions`, [endpoint])

  const upsertConversation = useCallback((summary: ConversationSummary) => {
    setConversationHistory((prev) => {
      const next = prev.filter((item) => item.sessionId !== summary.sessionId)
      next.unshift(summary)
      return next
    })
  }, [])

  const fetchSessionHistory = useCallback(
    async (sessionId: string): Promise<ParsedHistoryPayload> => {
      const response = await api.get(historyEndpoint, {
        params: { session_id: sessionId },
        headers: { 'x-tenant-id': tenantIdToUse }
      })

      return parseHistoryPayload(response.data)
    },
    [historyEndpoint, tenantIdToUse]
  )

  const fetchSessionList = useCallback(async (): Promise<ConversationSummary[]> => {
    const response = await api.get(conversationsEndpoint, {
      headers: { 'x-tenant-id': tenantIdToUse }
    })

    const rawList = getPossibleConversationList(response.data)

    return rawList
      .filter((entry): entry is SessionListItem => isRecord(entry))
      .map((entry) => buildSummaryFromSession(entry))
      .filter((entry): entry is ConversationSummary => !!entry)
      .sort((a, b) => {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        return bTime - aTime
      })
  }, [conversationsEndpoint, tenantIdToUse])

  const restoreFromSession = useCallback(
    async (sessionId: string) => {
      setIsRestoring(true)
      setIsHistoryLoading(true)
      try {
        const restored = await fetchSessionHistory(sessionId)
        if (restored.messages.length) {
          setMessages(restored.messages)
          saveContext(sessionId, restored.taskId)
          upsertConversation(
            buildSummaryFromMessages(
              sessionId,
              restored.messages,
              restored.updatedAt ?? new Date().toISOString(),
              sessionId,
              restored.taskId ?? undefined
            )
          )
        }
      } catch {
        setMessages((prev) => {
          if (prev.length) return prev
          return [
            {
              id: randomId(),
              role: 'assistant',
              text: 'Unable to restore chat history right now.'
            }
          ]
        })
      } finally {
        setIsRestoring(false)
        setIsHistoryLoading(false)
      }
    },
    [fetchSessionHistory, saveContext, upsertConversation]
  )

  const startNewChat = useCallback(() => {
    saveContext(null, null)
    setMessages([])
    setComposerText('')
    setStatus('ready')
    setShowHistoryPanel(false)
    lastRestoredContextRef.current = null
  }, [saveContext])

  const loadConversation = useCallback(
    async (session: ConversationSummary) => {
      if (session.messages.length) {
        setMessages(session.messages)
        saveContext(session.sessionId, session.taskId ?? null)
        setShowHistoryPanel(false)
        return
      }

      await restoreFromSession(session.sessionId)
      setShowHistoryPanel(false)
    },
    [restoreFromSession, saveContext]
  )

  useEffect(() => {
    if (!isOpen || !showHistoryPanel) return

    setIsHistoryLoading(true)
    void fetchSessionList()
      .then((rows) => {
        setConversationHistory((prev) => {
          // Keep hydrated message payloads if we already loaded any session details.
          const prevById = new Map(prev.map((item) => [item.sessionId, item]))
          return rows.map((row) => {
            const existing = prevById.get(row.sessionId)
            if (!existing) return row

            const title = row.title !== 'New chat' ? row.title : existing.title
            const preview = existing.preview || row.preview
            const messages = existing.messages.length ? existing.messages : row.messages

            return {
              ...row,
              title,
              preview,
              messages,
              taskId: existing.taskId ?? row.taskId
            }
          })
        })
      })
      .catch(() => {
        // Keep whatever local history we already have.
      })
      .finally(() => {
        setIsHistoryLoading(false)
      })
  }, [isOpen, showHistoryPanel, fetchSessionList])

  useEffect(() => {
    if (!isOpen || !contextId || messages.length > 0) return
    if (lastRestoredContextRef.current === contextId) return

    lastRestoredContextRef.current = contextId
    void restoreFromSession(contextId)
  }, [isOpen, contextId, messages.length, restoreFromSession])

  useEffect(() => {
    if (!contextId || !messages.length) return
    upsertConversation(
      buildSummaryFromMessages(contextId, messages, new Date().toISOString(), contextId, localTaskId ?? undefined)
    )
  }, [contextId, localTaskId, messages, upsertConversation])

  // Core fetch — shared by sendMessage and sendApproval
  const postToAgent = useCallback(
    async (text: string, taskId?: string | null, extraParts?: Part[]): Promise<ParsedResponse> => {
      const controller = new AbortController()
      setAbortController(controller)

      const initialContextId = contextId ?? null

      const payload = {
        jsonrpc: '2.0',
        id: randomId(),
        method: 'message/send',
        params: {
          message: {
            role: 'user',
            parts: [{ kind: 'text', text }, ...(extraParts || [])],
            messageId: randomId(),
            ...(initialContextId ? { contextId: initialContextId } : {}),
            ...(taskId ? { taskId } : {}) // required for HITL resume
          },
          metadata: {
            adk_state: {
              timezone: selectedTimezone,
              course_id: courseIdFromContext ?? 'general'
            }
          }
        }
      }

      try {
        const res = await api.post(endpoint, payload, {
          headers: {
            'x-tenant-id': tenantIdToUse
          },
          signal: controller.signal
        })
        console.log(tenantIdToUse)

        return parseResponse(res.data as OrchestratorResponse)
      } finally {
        setAbortController((prev) => (prev === controller ? null : prev))
      }
    },
    [contextId, courseIdFromContext, endpoint, selectedTimezone, tenantIdToUse]
  )

  const handleResponse = useCallback(
    (parsed: ParsedResponse) => {
      const stableContextId = contextId ?? parsed.contextId ?? null
      saveContext(stableContextId, parsed.state === 'input-required' ? parsed.taskId : null)

      const assistantMsg: ChatMessage = {
        id: randomId(),
        role: 'assistant',
        text: parsed.agentText || 'No response text returned.',
        ...(parsed.pendingApproval ? { pendingApproval: parsed.pendingApproval } : {})
      }

      setMessages((prev) => [...prev, assistantMsg])
      setStatus('ready')
    },
    [contextId, saveContext]
  )

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !canSubmit || requestInFlightRef.current) return

      requestInFlightRef.current = true

      setMessages((prev) => [...prev, { id: randomId(), role: 'user', text }])
      setStatus('submitted')
      setComposerText('')
      setShowHistoryPanel(false)

      try {
        const parsed = await postToAgent(text)
        handleResponse(parsed)
      } catch (error) {
        if (isRequestCanceled(error)) {
          setMessages((prev) => [...prev, { id: randomId(), role: 'assistant', text: 'Request canceled.' }])
          setStatus('ready')
          return
        }

        setMessages((prev) => [
          ...prev,
          { id: randomId(), role: 'assistant', text: 'Could not reach the AI endpoint. Please try again.' }
        ])
        setStatus('error')
      } finally {
        requestInFlightRef.current = false
      }
    },
    [canSubmit, postToAgent, handleResponse]
  )

  const sendApproval = useCallback(
    async (decision: 'approved' | 'rejected') => {
      if (!canSubmit || requestInFlightRef.current) return

      requestInFlightRef.current = true
      setStatus('submitted')

      const activePendingApproval = [...messages]
        .reverse()
        .find(
          (m): m is Extract<ChatMessage, { role: 'assistant'; pendingApproval?: PendingApproval }> =>
            m.role === 'assistant' && !!m.pendingApproval
        )?.pendingApproval
      const approvalIdToUse = activePendingApproval?.approvalId || activePendingApproval?.functionCallId
      const decisionText = approvalIdToUse
        ? `${decision} ${approvalIdToUse}`
        : decision

      let extraParts: Part[] | undefined = undefined
      if (activePendingApproval?.functionCallId) {
        extraParts = [
          {
            kind: 'data',
            metadata: {
              adk_type: 'function_response'
            },
            data: {
              id: activePendingApproval.functionCallId,
              name: activePendingApproval.functionName || 'request_schedule_approval',
              response: {
                result: decisionText
              }
            }
          }
        ]
      }

      // Optimistically disable the approval card
      setMessages((prev) =>
        prev
          .map((m) => (m.role === 'assistant' && m.pendingApproval ? { ...m, pendingApproval: undefined } : m))
          .concat({ id: randomId(), role: 'user', text: decisionText })
      )

      try {
        // Must send taskId to resume the suspended long-running tool
        const parsed = await postToAgent(decisionText, localTaskId, extraParts)
        handleResponse(parsed)
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: randomId(), role: 'assistant', text: 'Could not process your decision. Please try again.' }
        ])
        setStatus('error')
      } finally {
        requestInFlightRef.current = false
      }
    },
    [canSubmit, messages, postToAgent, handleResponse, localTaskId]
  )

  const cancelRequest = useCallback(() => {
    if (!abortController) return
    abortController.abort()
  }, [abortController])

  return (
    <>
      {/* FAB trigger button */}
      {!isOpen && (
        <Button
          className='fixed right-6 bottom-6 z-50 size-14 rounded-full bg-[#252641] shadow-[0_8px_32px_rgba(37,38,65,0.35)] transition-all duration-200 hover:scale-105 hover:bg-[#1a1b3a] hover:shadow-[0_12px_40px_rgba(37,38,65,0.45)]'
          onClick={openWidget}
          size='icon'
          type='button'
        >
          <MessageCircleIcon className='size-6 text-[#FFD600]' />
          <span className='sr-only'>Open chat</span>
        </Button>
      )}

      {isOpen && (
        <section className='fixed right-6 bottom-6 z-50 flex h-[72vh] w-[min(92vw,440px)] flex-col overflow-hidden rounded-[24px] border border-[#FFD600]/30 bg-white shadow-[0_24px_80px_rgba(37,38,65,0.18),0_4px_16px_rgba(37,38,65,0.08)]'>
          {/* ── Header ── */}
          <header className='flex items-center justify-between bg-[#252641] px-5 py-3.5'>
            <div className='flex items-center gap-3'>
              {/* Avatar dot */}
              <div className='flex size-8 items-center justify-center rounded-full bg-[#FFD600]/20 ring-1 ring-[#FFD600]/40'>
                <span className='text-sm'>✦</span>
              </div>
              <div>
                <p className='font-semibold text-sm text-white'>Learning Assistant</p>
                <p className='text-[11px] text-white/60'>
                  {isRestoring ? 'Restoring chat…' : 'Connected to orchestrator'}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-0.5'>
              <Button
                className='size-8 rounded-lg text-white/70 hover:bg-white/10 hover:text-white'
                onClick={startNewChat}
                size='icon-sm'
                type='button'
                variant='ghost'
              >
                <PlusIcon className='size-4' />
                <span className='sr-only'>Start new chat</span>
              </Button>
              <Button
                className={`size-8 rounded-lg text-white/70 hover:bg-white/10 hover:text-white ${showHistoryPanel ? 'bg-white/15 text-white' : ''}`}
                onClick={() => setShowHistoryPanel((prev) => !prev)}
                size='icon-sm'
                type='button'
                variant='ghost'
              >
                <ListIcon className='size-4' />
                <span className='sr-only'>Toggle history panel</span>
              </Button>
              <Button
                className='size-8 rounded-lg text-white/70 hover:bg-white/10 hover:text-white'
                onClick={closeWidget}
                size='icon-sm'
                type='button'
                variant='ghost'
              >
                <XIcon className='size-4' />
                <span className='sr-only'>Close chat</span>
              </Button>
            </div>
          </header>

          {/* ── History Panel ── */}
          {showHistoryPanel ? (
            <div className='flex min-h-0 flex-1 flex-col bg-white'>
              <div className='border-b border-gray-100 p-3'>
                <Button
                  className='h-9 w-full justify-start gap-2 rounded-xl border border-gray-200 bg-white text-[#252641] text-sm font-medium hover:bg-gray-50 hover:border-[#252641]/20'
                  onClick={startNewChat}
                  type='button'
                  variant='outline'
                >
                  <PlusIcon className='size-4 text-[#FFD600]' /> New chat
                </Button>
              </div>
              <div className='flex-1 overflow-y-auto p-3'>
                {isHistoryLoading ? (
                  <p className='p-2 text-sm text-gray-400'>Loading conversations…</p>
                ) : conversationHistory.length === 0 ? (
                  <p className='p-2 text-sm text-gray-400'>No previous conversations found.</p>
                ) : (
                  (['Today', 'Yesterday', 'Earlier'] as const).map((group) => {
                    const rows = conversationHistory.filter((item) => groupLabelFromDate(item.updatedAt) === group)

                    if (rows.length === 0) return null

                    return (
                      <div className='mb-4' key={group}>
                        <p className='px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400'>
                          {group}
                        </p>
                        <div className='space-y-1'>
                          {rows.map((item) => (
                            <button
                              className={`w-full rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                                item.sessionId === contextId
                                  ? 'bg-[#252641]/8 border border-[#252641]/15'
                                  : 'hover:bg-gray-50 border border-transparent'
                              }`}
                              key={item.sessionId}
                              onClick={() => void loadConversation(item)}
                              type='button'
                            >
                              <div className='flex items-start justify-between gap-2'>
                                <p className='line-clamp-1 text-sm font-medium text-[#252641]'>{item.title}</p>
                                <span className='shrink-0 text-[11px] text-gray-400'>
                                  {formatRelativeDate(item.updatedAt)}
                                </span>
                              </div>
                              <p className='line-clamp-1 text-xs text-gray-400 mt-0.5'>
                                {item.preview || 'Open conversation'}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          ) : (
            /* ── Conversation ── */
            <Conversation className='bg-[#f8f8fb]'>
              <ConversationContent className='px-4 py-5'>
                {messages.length === 0 ? (
                  <ConversationEmptyState
                    description='Ask about courses, schedules, or syllabus content.'
                    title='No messages yet'
                  >
                    <p className='max-w-[150px] text-sm text-gray-400'>{FALLBACK_WELCOME}</p>
                  </ConversationEmptyState>
                ) : (
                  messages.map((msg) => (
                    <Message
                      className={
                        msg.role === 'assistant'
                          ? 'mb-4 mr-auto max-w-[88%] animate-[fadeInUp_0.2s_ease-out]'
                          : 'mb-4 ml-auto max-w-[80%] animate-[fadeInUp_0.2s_ease-out]'
                      }
                      from={msg.role}
                      key={msg.id}
                    >
                      <MessageContent
                        className={
                          msg.role === 'assistant'
                            ? [
                                'rounded-[20px] rounded-tl-[4px]',
                                'border-l-[3px] border-l-[#FFD600]',
                                'bg-white px-4 py-3',
                                'text-[#252641] shadow-[0_2px_12px_rgba(37,38,65,0.07)]',
                                // ── table overrides ──────────────────────────────
                                '[&_[data-streamdown=table]]:w-full [&_[data-streamdown=table]]:border-collapse [&_[data-streamdown=table]]:rounded-xl [&_[data-streamdown=table]]:overflow-hidden [&_[data-streamdown=table]]:border [&_[data-streamdown=table]]:border-gray-200 [&_[data-streamdown=table]]:text-sm',
                                '[&_[data-streamdown=table-header]]:!bg-[#252641]',
                                '[&_[data-streamdown=table-header-cell]]:!text-white [&_[data-streamdown=table-header-cell]]:!font-semibold [&_[data-streamdown=table-header-cell]]:px-4 [&_[data-streamdown=table-header-cell]]:py-2.5 [&_[data-streamdown=table-header-cell]]:!text-xs [&_[data-streamdown=table-header-cell]]:tracking-wide [&_[data-streamdown=table-header-cell]]:uppercase',
                                '[&_[data-streamdown=table-body]]:!bg-transparent',
                                '[&_[data-streamdown=table-row]:nth-child(even)]:bg-[#f8f8fb]',
                                '[&_[data-streamdown=table-row]:nth-child(odd)]:bg-white',
                                '[&_[data-streamdown=table-cell]]:!bg-transparent [&_[data-streamdown=table-cell]]:px-4 [&_[data-streamdown=table-cell]]:py-3 [&_[data-streamdown=table-cell]]:text-[#252641] [&_[data-streamdown=table-cell]]:align-top [&_[data-streamdown=table-cell]]:leading-snug',
                                // ── typography ───────────────────────────────────
                                '[&_p]:leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0',
                                '[&_strong]:font-semibold [&_strong]:text-[#252641]',
                                '[&_code]:rounded [&_code]:bg-[#f0f0f5] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono [&_code]:text-[#252641]',
                                '[&_pre]:rounded-xl [&_pre]:bg-[#1e1f3a] [&_pre]:p-4 [&_pre]:text-xs [&_pre]:text-gray-200 [&_pre]:overflow-x-auto',
                                '[&_ul]:ml-4 [&_ul]:space-y-1 [&_ol]:ml-4 [&_ol]:space-y-1',
                                '[&_li]:leading-relaxed'
                              ].join(' ')
                            : 'rounded-[20px] rounded-tr-[4px] bg-[#252641] px-4 py-3 text-white shadow-[0_2px_12px_rgba(37,38,65,0.2)]'
                        }
                      >
                        {msg.role === 'assistant' ? (
                          <>
                            <MessageResponse>{msg.text}</MessageResponse>
                            {msg.pendingApproval && (
                              <ApprovalCard
                                approval={msg.pendingApproval}
                                disabled={!canSubmit}
                                onApprove={() => sendApproval('approved')}
                                onReject={() => sendApproval('rejected')}
                              />
                            )}
                          </>
                        ) : (
                          <p className='whitespace-pre-wrap text-sm leading-relaxed'>{msg.text}</p>
                        )}
                      </MessageContent>
                    </Message>
                  ))
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          )}

          {/* ── Input area ── */}
          {!showHistoryPanel && (
            <div className='border-t border-gray-100 bg-white p-3'>
              <PromptInput
                className='rounded-2xl border border-gray-200 bg-white shadow-none transition-all focus-within:border-[#FFD600] focus-within:ring-2 focus-within:ring-[#FFD600]/20'
                onSubmit={async ({ text }) => sendMessage(text)}
              >
                <PromptInputBody>
                  <PromptInputTextarea
                    className='resize-none text-sm text-[#252641] placeholder:text-gray-400'
                    onChange={(e) => setComposerText(e.currentTarget.value)}
                    placeholder='Ask anything…'
                    value={composerText}
                  />
                </PromptInputBody>
                <PromptInputFooter className='px-3 pb-2'>
                  <PromptInputTools>
                    <Select onValueChange={setSelectedTimezone} value={selectedTimezone}>
                      <SelectTrigger
                        className='h-7 max-w-48 gap-1 rounded-lg border-gray-200 px-2 text-xs text-gray-500 hover:border-gray-300 focus:ring-[#FFD600]/20'
                        size='sm'
                      >
                        <PlusIcon className='size-3 text-gray-400' />
                        <SelectValue placeholder='Timezone' />
                      </SelectTrigger>
                      <SelectContent align='start' className='max-h-72'>
                        <SelectGroup>
                          <SelectLabel>Select timezone</SelectLabel>
                          {timezoneOptions.map((zone) => (
                            <SelectItem key={zone.value} value={zone.value}>
                              {zone.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </PromptInputTools>
                  {/* Send button styled with brand colors */}
                  <PromptInputSubmit
                    className='size-8 rounded-xl bg-[#FFD600] text-[#252641] shadow-none hover:bg-[#f0c900] active:scale-95 transition-all disabled:opacity-40'
                    onStop={cancelRequest}
                    status={status}
                  />
                </PromptInputFooter>
              </PromptInput>
            </div>
          )}
        </section>
      )}

      {/* Keyframe for message fade-in */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
