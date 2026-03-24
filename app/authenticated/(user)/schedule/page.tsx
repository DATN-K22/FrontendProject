"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  IconButton,
  List,
  ListItem,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import api from "@/api/api";
import { getAllTimezones, getTimezone } from "countries-and-timezones";
import { RRule, type Options as RRuleOptions } from "rrule";

type EventStatus = "CONFIRMED" | "TENTATIVE" | "CANCELLED";

type BackendEventException = {
  id: string | number;
  event_id: string | number;
  exception_date: string | Date;
  reason?: string;
};

type BackendEvent = {
  id: string | number;
  user_id: string;
  uid: string;
  title: string;
  description?: string;
  location?: string;
  status: EventStatus;
  time_start: string | Date;
  time_end: string | Date;
  timezone?: string;
  rrule_string?: string;
  sequence: number;
  created_at: string | Date;
  updated_at: string | Date;
  recurrence_id?: string | Date;
  original_event_id?: string | number;
  exception_dates?: BackendEventException[];
  exceptions?: BackendEvent[];
};

type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  recurrenceRule?: string;
  timezone?: string;
  date: string;
  start: string;
  end: string;
  tag: "Class" | "Lab" | "Review";
  startEpoch: number;
  endEpoch: number;
};

const hours = Array.from({ length: 24 }, (_, index) => `${index}:00`);
const calendarGridFirstHour = Number(hours[0].split(":")[0]);
const calendarGridHourHeight = 64;
const calendarGridHeaderHeight = 44;
const calendarGridMinHeight = calendarGridHeaderHeight + hours.length * calendarGridHourHeight;
const calendarGridRowTemplate = `${calendarGridHeaderHeight}px repeat(${hours.length}, ${calendarGridHourHeight}px)`;

// Static fallback events — epochs stored as UTC so offset-aware display works correctly
const weekEvents: CalendarEvent[] = [
  {
    id: "e1",
    title: "UI/UX Conclave Design",
    description: "Sprint design review for dashboard interactions.",
    date: "2026-03-20",
    start: "12:00",
    end: "13:00",
    tag: "Class",
    startEpoch: new Date("2026-03-20T12:00:00Z").getTime(),
    endEpoch: new Date("2026-03-20T13:00:00Z").getTime(),
  },
  {
    id: "e2",
    title: "Cloud Lab Sprint",
    description: "Lab session for deployment and monitoring tasks.",
    date: "2026-03-31",
    start: "14:00",
    end: "15:30",
    tag: "Lab",
    startEpoch: new Date("2026-03-31T14:00:00Z").getTime(),
    endEpoch: new Date("2026-03-31T15:30:00Z").getTime(),
  },
  {
    id: "e3",
    title: "Global Project Review",
    description: "Cross-team status review and feedback.",
    date: "2026-03-28",
    start: "11:30",
    end: "12:30",
    tag: "Review",
    startEpoch: new Date("2026-03-28T11:30:00Z").getTime(),
    endEpoch: new Date("2026-03-28T12:30:00Z").getTime(),
  },
  {
    id: "e4",
    title: "Frontend Architecture",
    description: "Architecture deep dive for component boundaries.",
    date: "2026-03-20",
    start: "09:00",
    end: "10:30",
    tag: "Class",
    startEpoch: new Date("2026-03-20T09:00:00Z").getTime(),
    endEpoch: new Date("2026-03-20T10:30:00Z").getTime(),
  },
  {
    id: "e5",
    title: "Lab Debrief",
    description: "Wrap-up and action items from the lab.",
    date: "2026-03-20",
    start: "16:00",
    end: "17:00",
    tag: "Lab",
    startEpoch: new Date("2026-03-20T16:00:00Z").getTime(),
    endEpoch: new Date("2026-03-20T17:00:00Z").getTime(),
  },
];

const chipColorMap: Record<CalendarEvent["tag"], "primary" | "success" | "warning"> = {
  Class: "primary",
  Lab: "success",
  Review: "warning",
};

const pad = (value: number) => value.toString().padStart(2, "0");

// ─── Offset-aware date helpers ────────────────────────────────────────────────

/**
 * Shift a UTC epoch by the user-selected offset, then read the date
 * components using UTC getters — this gives the "wall clock" date/time
 * in the selected timezone without relying on the browser's local timezone.
 */
const shiftUtcDateByOffset = (utcDate: Date, offsetMinutes: number) => {
  return new Date(utcDate.getTime() + offsetMinutes * 60 * 1000);
};

const toIsoDateInOffset = (utcDate: Date, offsetMinutes: number) => {
  const shifted = shiftUtcDateByOffset(utcDate, offsetMinutes);
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
};

const toHhMmInOffset = (utcDate: Date, offsetMinutes: number) => {
  const shifted = shiftUtcDateByOffset(utcDate, offsetMinutes);
  return `${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`;
};

/**
 * Convert a plain local-date (year/month/day from selectedDate) to a
 * YYYY-MM-DD string using offset-aware logic so the column label matches
 * what the user sees in their chosen GMT zone.
 */
const toIsoDateOffset = (date: Date) => {
  // // Treat the date as representing midnight UTC in the selected offset zone.
  // // We reconstruct a UTC epoch for midnight-in-offset and format from that.
  // const utcMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  // // Shift forward by offset so the UTC getters read the correct wall-clock date
  // const shifted = new Date(utcMidnight - offsetMinutes * 60 * 1000 + offsetMinutes * 60 * 1000);
  // // Simpler: just format from the plain date components (they're already the
  // // "logical" date the user navigated to — not timezone-shifted).
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const addDays = (date: Date, amount: number) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
};

const startOfWeekMonday = (date: Date) => {
  const normalizedDay = (date.getDay() + 6) % 7;
  return addDays(date, -normalizedDay);
};

const monthYearLabel = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
};

const shortDateLabel = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const weekdayUpperLabel = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date).toUpperCase();
};

const toTwelveHour = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;
  return `${normalizedHour}:${pad(minute)} ${suffix}`;
};

const weekdayLabel = (date: Date) => {
  const label = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
  return `${label} ${date.getDate()}`;
};

const buildMiniCalendar = (anchorDate: Date) => {
  const monthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const firstDay = monthStart.getDay();
  const gridStart = addDays(monthStart, -firstDay);

  return Array.from({ length: 6 }, (_, weekIndex) => {
    return Array.from({ length: 7 }, (_, dayIndex) => {
      const cellDate = addDays(gridStart, weekIndex * 7 + dayIndex);
      return {
        date: cellDate,
        inCurrentMonth: cellDate.getMonth() === anchorDate.getMonth(),
      };
    });
  });
};

const incomingDotColorMap: Record<CalendarEvent["tag"], string> = {
  Class: "#3B82F6",
  Lab: "#EC4899",
  Review: "#FBBF24",
};

const toReadableLocation = (timezoneName: string) => {
  return timezoneName.replace(/_/g, " ");
};

const gmtOptions = (() => {
  const zones = Object.entries(getAllTimezones());

  return zones
    .sort((left, right) => {
      const offsetDiff = left[1].utcOffset - right[1].utcOffset;
      if (offsetDiff !== 0) return offsetDiff;
      return left[0].localeCompare(right[0]);
    })
    .map(([timezoneName, timezoneInfo]) => ({
      value: timezoneName,
      label: `${formatGmtOffset(timezoneInfo.utcOffset)} ${toReadableLocation(timezoneName)}`.trim(),
      offsetMinutes: timezoneInfo.utcOffset,
    }));
})();

function formatGmtOffset(offsetMinutes: number) {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;
  if (minutes === 0) {
    return `GMT${sign}${hours}`;
  }
  return `GMT${sign}${hours}:${pad(minutes)}`;
}

const hasExplicitTimezone = (value: string) => {
  return /(?:Z|[+\-]\d{2}:?\d{2})$/i.test(value.trim());
};

const parseLocalDateTimeString = (value: string) => {
  const normalized = value.trim().replace(" ", "T");
  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2})(?::(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?)?$/,
  );

  if (!match) {
    return null;
  }

  const [, year, month, day, hour = "00", minute = "00", second = "00", millisecond = "0"] = match;
  const ms = millisecond.padEnd(3, "0");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    Number(ms),
  );
};

const parseMaybeDate = (value: string | Date | undefined) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const trimmed = value.trim();
  let parsed: Date;

  if (!hasExplicitTimezone(trimmed)) {
    const localParsed = parseLocalDateTimeString(trimmed);
    parsed = localParsed ?? new Date(trimmed);
  } else {
    parsed = new Date(trimmed);
  }

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeStartOfDay = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const normalizeEndOfDay = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
};

const parseRRuleOptions = (rruleString: string, dtstart: Date): Partial<RRuleOptions> | null => {
  try {
    const normalizedRrule = rruleString.trim().replace(/^RRULE:/i, "");
    return {
      ...RRule.parseString(normalizedRrule),
      dtstart,
    };
  } catch {
    return null;
  }
};

const mapStatusToTag = (status: EventStatus): CalendarEvent["tag"] => {
  if (status === "TENTATIVE") return "Review";
  if (status === "CANCELLED") return "Lab";
  return "Class";
};

const buildCalendarEvent = (
  event: BackendEvent,
  startDate: Date,
  endDate: Date,
  offsetMinutes: number,
  idSuffix?: string,
): CalendarEvent => {
  return {
    id: `${String(event.id)}-${idSuffix ?? startDate.toISOString()}`,
    title: event.title,
    description: event.description,
    recurrenceRule: event.rrule_string,
    timezone: event.timezone,
    date: toIsoDateInOffset(startDate, offsetMinutes),
    start: toHhMmInOffset(startDate, offsetMinutes),
    end: toHhMmInOffset(endDate, offsetMinutes),
    tag: mapStatusToTag(event.status),
    startEpoch: startDate.getTime(),
    endEpoch: endDate.getTime(),
  };
};

const expandRecurringStarts = (
  startAt: Date,
  rrule: string,
  rangeStart: Date,
  rangeEnd: Date,
): Date[] => {
  const options = parseRRuleOptions(rrule, startAt);
  if (!options) return [];

  try {
    const rule = new RRule(options);
    return rule.between(rangeStart, rangeEnd, true);
  } catch {
    return [];
  }
};

const mapFrequencyToRRule = (frequency: "DAILY" | "WEEKLY" | "MONTHLY") => {
  if (frequency === "DAILY") return RRule.DAILY;
  if (frequency === "WEEKLY") return RRule.WEEKLY;
  return RRule.MONTHLY;
};

const mapFrequencyFromRRule = (frequency: number | undefined): "DAILY" | "WEEKLY" | "MONTHLY" | null => {
  if (frequency === RRule.DAILY) return "DAILY";
  if (frequency === RRule.WEEKLY) return "WEEKLY";
  if (frequency === RRule.MONTHLY) return "MONTHLY";
  return null;
};

const expandBackendEvents = (
  events: BackendEvent[],
  rangeStart: Date,
  rangeEnd: Date,
  offsetMinutes: number,
): CalendarEvent[] => {
  const masters = events.filter((event) => !event.original_event_id);
  const overrides = events.filter((event) => event.original_event_id && event.recurrence_id);

  const overrideMap = new Map<string, BackendEvent>();
  overrides.forEach((override) => {
    const recurrenceDate = parseMaybeDate(override.recurrence_id);
    if (!recurrenceDate) return;
    const key = `${String(override.original_event_id)}|${recurrenceDate.toISOString()}`;
    overrideMap.set(key, override);
  });

  const expanded: CalendarEvent[] = [];

  masters.forEach((event) => {
    if (event.status === "CANCELLED") return;

    const startAt = parseMaybeDate(event.time_start);
    const endAt = parseMaybeDate(event.time_end);
    if (!startAt || !endAt) return;

    const durationMs = Math.max(0, endAt.getTime() - startAt.getTime());
    const exceptionSet = new Set(
      (event.exception_dates ?? [])
        .map((exception) => parseMaybeDate(exception.exception_date))
        .filter((value): value is Date => Boolean(value))
        .map((value) => value.toISOString()),
    );

    if (!event.rrule_string) {
      if (startAt.getTime() >= rangeStart.getTime() && startAt.getTime() <= rangeEnd.getTime()) {
        expanded.push(buildCalendarEvent(event, startAt, endAt, offsetMinutes));
      }
      return;
    }

    const recurringStarts = expandRecurringStarts(startAt, event.rrule_string, rangeStart, rangeEnd);

    recurringStarts.forEach((occurrenceStart) => {
      const occurrenceIso = occurrenceStart.toISOString();
      if (exceptionSet.has(occurrenceIso)) return;

      const overrideKey = `${String(event.id)}|${occurrenceIso}`;
      const override = overrideMap.get(overrideKey);
      if (override && override.status !== "CANCELLED") {
        const overrideStart = parseMaybeDate(override.time_start);
        const overrideEnd = parseMaybeDate(override.time_end);
        if (overrideStart && overrideEnd) {
          expanded.push(buildCalendarEvent(override, overrideStart, overrideEnd, offsetMinutes, occurrenceIso));
        }
        return;
      }

      const occurrenceEnd = new Date(occurrenceStart.getTime() + durationMs);
      expanded.push(buildCalendarEvent(event, occurrenceStart, occurrenceEnd, offsetMinutes, occurrenceIso));
    });
  });

  expanded.sort((left, right) => {
    return left.startEpoch - right.startEpoch;
  });

  return expanded;
};

const extractEventsFromPayload = (payload: unknown): BackendEvent[] => {
  if (Array.isArray(payload)) return payload as BackendEvent[];

  if (!payload || typeof payload !== "object") return [];

  const maybeObject = payload as Record<string, unknown>;

  const directCandidates = [
    maybeObject.data,
    maybeObject.events,
    maybeObject.items,
    maybeObject.results,
  ];

  for (const candidate of directCandidates) {
    if (Array.isArray(candidate)) return candidate as BackendEvent[];
  }

  if (maybeObject.schedule && typeof maybeObject.schedule === "object") {
    const schedule = maybeObject.schedule as Record<string, unknown>;
    if (Array.isArray(schedule.events)) return schedule.events as BackendEvent[];
  }

  return [];
};

// ─── Offset-aware static event re-mapping ────────────────────────────────────

/**
 * Re-derive `date`, `start`, and `end` strings for static (weekEvents) entries
 * from their stored UTC epochs using the currently selected offset.
 * This ensures static events move correctly when the user changes GMT.
 */
const remapStaticEvents = (events: CalendarEvent[], offsetMinutes: number): CalendarEvent[] => {
  return events.map((event) => {
    const startDate = new Date(event.startEpoch);
    const endDate = new Date(event.endEpoch);
    return {
      ...event,
      date: toIsoDateInOffset(startDate, offsetMinutes),
      start: toHhMmInOffset(startDate, offsetMinutes),
      end: toHhMmInOffset(endDate, offsetMinutes),
    };
  });
};

// ─── Epoch helpers ────────────────────────────────────────────────────────────

/**
 * Return the UTC epoch ms for midnight of `selectedDate` expressed in the
 * selected offset zone.  Example: selectedDate = Mar 21, offsetMinutes = +420
 * → midnight of Mar 21 GMT+7 → UTC 2026-03-20T17:00:00Z.
 */
const selectedDayStartEpoch = (selectedDate: Date, offsetMinutes: number) => {
  return (
    Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0) -
    offsetMinutes * 60 * 1000
  );
};

const toDateTimeLocalValue = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toDateInputValue = (date: Date) => {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
};

const recurrenceLabelMap = {
  DAILY: "day",
  WEEKLY: "week",
  MONTHLY: "month",
} as const;

export default function SchedulePage() {
  const detectedOffset = -new Date().getTimezoneOffset();
  const defaultTimezone = gmtOptions.find((option) => option.offsetMinutes === detectedOffset) ?? gmtOptions[0];

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewMonthDate, setViewMonthDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedTimezoneName, setSelectedTimezoneName] = useState(() => defaultTimezone?.value ?? "Etc/UTC");
  const [displayOffsetMinutes, setDisplayOffsetMinutes] = useState(() => defaultTimezone?.offsetMinutes ?? detectedOffset);
  const [backendEvents, setBackendEvents] = useState<BackendEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formStartDateTime, setFormStartDateTime] = useState(() => toDateTimeLocalValue(new Date()));
  const [formEndDateTime, setFormEndDateTime] = useState(() => toDateTimeLocalValue(new Date(Date.now() + 30 * 60 * 1000)));
  const [formDescription, setFormDescription] = useState("");
  const [isRecurrenceDialogOpen, setIsRecurrenceDialogOpen] = useState(false);
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("WEEKLY");
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceUntil, setRecurrenceUntil] = useState("");
  const [recurringActionDialog, setRecurringActionDialog] = useState<{
  open: boolean;
  mode: "edit" | "delete";
} | null>(null);



  useEffect(() => {
    let active = true;

    const fetchEvents = async () => {
      try {
        const rangeStart = normalizeStartOfDay(addDays(selectedDate, -30)).toISOString();
        const rangeEnd = normalizeEndOfDay(addDays(selectedDate, 90)).toISOString();

        const responses = await Promise.allSettled([
          api.get("/users/schedule"),
          api.get("/users/schedule/events/search", {
            params: { range_start: rangeStart, range_end: rangeEnd },
          }),
        ]);

        const successPayloads: unknown[] = [];
        responses.forEach((result) => {
          if (result.status === "fulfilled") successPayloads.push(result.value.data);
        });

        const mergedEvents = successPayloads.flatMap((payload) => extractEventsFromPayload(payload));
        const dedupedById = Array.from(
          new Map(mergedEvents.map((event) => [String(event.id), event])).values(),
        );

        if (active) setBackendEvents(dedupedById);
      } catch {
        if (active) setBackendEvents([]);
      }
    };

    fetchEvents();
    return () => { active = false; };
  }, [selectedDate]);

  // ── Visible date columns ────────────────────────────────────────────────────
  // `visibleDates` intentionally stays as plain JS Dates representing the
  // "logical" navigation days (what the user clicked/navigated to).
  // The offset is applied when we format labels and when we match event.date
  // strings — both of which use toIsoDateInOffset / toIsoDateOffset.
  const visibleDates = useMemo(() => {
    if (viewMode === "day") return [selectedDate];
    const weekStart = startOfWeekMonday(selectedDate);
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [selectedDate, viewMode]);

  const expansionRange = useMemo(() => {
    const visibleStart = normalizeStartOfDay(visibleDates[0]);
    const visibleEnd = normalizeEndOfDay(visibleDates[visibleDates.length - 1]);
    const incomingEnd = normalizeEndOfDay(addDays(selectedDate, 60));
    const rangeEnd = incomingEnd.getTime() > visibleEnd.getTime() ? incomingEnd : visibleEnd;
    return { rangeStart: visibleStart, rangeEnd };
  }, [selectedDate, visibleDates]);

  // Re-expand / re-map whenever displayOffsetMinutes changes
  const effectiveEvents = useMemo(() => {
    if (backendEvents.length > 0) {
      return expandBackendEvents(
        backendEvents,
        expansionRange.rangeStart,
        expansionRange.rangeEnd,
        displayOffsetMinutes,
      );
    }
    // Re-derive date/start/end strings for static events from their UTC epochs
    return remapStaticEvents(weekEvents, displayOffsetMinutes);
  }, [backendEvents, displayOffsetMinutes, expansionRange]);

  // ── Group events by visible date column ────────────────────────────────────
  // Use toIsoDateOffset to get the YYYY-MM-DD string for each column in the
  // selected offset zone (not the browser's local timezone).
  const groupedByVisibleDates = useMemo(() => {
    return visibleDates.map((date) => {
      const iso = toIsoDateOffset(date);
      return effectiveEvents.filter((event) => event.date === iso);
    });
  }, [effectiveEvents, visibleDates]);

  const miniCalendar = useMemo(() => buildMiniCalendar(viewMonthDate), [viewMonthDate]);

  const incomingEventsByDay = useMemo(() => {
    const todayStart = selectedDayStartEpoch(selectedDate, displayOffsetMinutes);
    const upcoming = [...effectiveEvents]
      .filter((event) => event.startEpoch >= todayStart)
      .sort((a, b) => a.startEpoch - b.startEpoch);

    return upcoming.reduce<Array<{ date: string; events: CalendarEvent[] }>>((accumulator, event) => {
      const existingGroup = accumulator.find((group) => group.date === event.date);
      if (existingGroup) {
        existingGroup.events.push(event);
        return accumulator;
      }
      accumulator.push({ date: event.date, events: [event] });
      return accumulator;
    }, []);
  }, [displayOffsetMinutes, effectiveEvents, selectedDate]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return effectiveEvents.find((event) => event.id === selectedEventId) ?? null;
  }, [effectiveEvents, selectedEventId]);

  const formTimezoneLabel = useMemo(() => {
    if (selectedEvent?.timezone) {
      const timezone = getTimezone(selectedEvent.timezone);
      if (timezone) {
        return `${timezone.name} (${timezone.utcOffsetStr})`;
      }

      return selectedEvent.timezone;
    }

    return formatGmtOffset(displayOffsetMinutes);
  }, [displayOffsetMinutes, selectedEvent]);

  const recurrenceSummary = useMemo(() => {
    if (!recurrenceEnabled) return "Does not repeat";

    const unit = recurrenceLabelMap[recurrenceFrequency];
    const pluralSuffix = recurrenceInterval > 1 ? "s" : "";
    const baseLabel = recurrenceInterval === 1 ? `Every ${unit}` : `Every ${recurrenceInterval} ${unit}${pluralSuffix}`;

    if (!recurrenceUntil) return baseLabel;

    const untilDate = new Date(`${recurrenceUntil}T00:00:00`);
    if (Number.isNaN(untilDate.getTime())) return baseLabel;

    return `${baseLabel} until ${shortDateLabel(untilDate)}`;
  }, [recurrenceEnabled, recurrenceFrequency, recurrenceInterval, recurrenceUntil]);


  // Tính max dựa trên formStartDateTime
  const formEndMax = useMemo(() => {
    if (!formStartDateTime) return undefined;
    
    // Lấy date part từ start, set max là 23:59 cùng ngày
    const datePart = formStartDateTime.split("T")[0];
    return `${datePart}T23:59`;
  }, [formStartDateTime]);

  

  // ── Form payload builders ────────────────────────────────────────────────────
  const buildRRule = () => {
    if (!recurrenceEnabled) return undefined;

    const options: Partial<RRuleOptions> = {
      freq: mapFrequencyToRRule(recurrenceFrequency),
      interval: Math.max(1, recurrenceInterval),
    };

    if (recurrenceUntil) {
      const [year, month, day] = recurrenceUntil.split("-").map(Number);
      if (year && month && day) {
        options.until = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      }
    }

    return RRule.optionsToString(options);
  };

  const buildPayload = () => {
    const tz = getTimezone(selectedTimezoneName);
    const offsetStr = tz?.utcOffsetStr ?? "+00:00"; // e.g. "+07:00"

    return {
      title: formTitle,
      description: formDescription || undefined,
      time_start: `${formStartDateTime}:00${offsetStr}`,
      time_end: `${formEndDateTime}:00${offsetStr}`,
      timezone: selectedTimezoneName,
      status: "CONFIRMED" as EventStatus,
      rrule_string: buildRRule(),
    };
  };

  const isRecurringEvent = selectedEvent?.recurrenceRule != null;

  const handleSaveEvent = async () => {
    if (selectedEvent && isRecurringEvent) {
      setRecurringActionDialog({ open: true, mode: "edit" });
      return;
    }
    executeSave('all');
  }

  const handleDeleteEvent = async () => {
    if (selectedEvent && isRecurringEvent) {
      setRecurringActionDialog({ open: true, mode: "delete" });
      return;
    }
    executeDelete('all');
  }

  const getRawId = () => {
    // id format: "123-2026-03-21T09:00:00.000Z"
    // rawId là phần trước dấu "-" đầu tiên
    return selectedEvent?.id.split("-")[0] ?? "";
  };

  const getRecurrenceId = () => {
    // phần sau rawId là ISO date của occurrence đó
    const parts = selectedEvent?.id.split("-") ?? [];
    return parts.slice(1).join("-"); // ghép lại phần còn lại
  };

  const executeSave = async (scope: 'this' | 'thisAndFollowing' | 'all') => {
    const payload = buildPayload();
    const rawId = getRawId();

    try {
      if (!selectedEvent) {
        await api.post("/users/schedule/events", payload);
      } else if (scope === 'this') {
        await api.post(`/users/schedule/events`, {
          ...payload,
          original_event_id: rawId,
          recurrence_id: getRecurrenceId(),
          rrule_string: undefined,
        });
      } else if (scope === 'thisAndFollowing') {
        await api.post(`/users/schedule/events/${rawId}/split`, {
          recurrence_id: getRecurrenceId(),
          updates: payload,
        });
      } else {
        await api.put(`/users/schedule/events/${rawId}`, payload);
      }
      await refetchEvents();
      setSelectedEventId(null);
      setRecurringActionDialog(null);
    } catch (error) {
      console.error("Error saving event:", error);
    } finally {
      setRecurringActionDialog(null);
    }
  }

  const executeDelete = async (scope: 'this' | 'all') => {
    const rawId = getRawId();

    try {
      if (scope === 'this') {
        await api.post(`/users/schedule/events/${rawId}/exceptions`, {
            event_id: Number(rawId),
            exception_date: getRecurrenceId(),
        });
      } else {
        await api.delete(`/users/schedule/events/${rawId}`);
      }
      await refetchEvents();
      setSelectedEventId(null);
      setRecurringActionDialog(null);
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setRecurringActionDialog(null);
    }
  }


  const refetchEvents = async () => {
    const rangeStart = normalizeStartOfDay(addDays(selectedDate, -30)).toISOString();
    const rangeEnd = normalizeEndOfDay(addDays(selectedDate, 90)).toISOString();
    const responses = await Promise.allSettled([
      api.get("/users/schedule"),
      api.get("/users/schedule/events/search", {
        params: { range_start: rangeStart, range_end: rangeEnd },
      }),
    ]);
    const payloads: unknown[] = [];
    responses.forEach((r) => {
      if (r.status === "fulfilled") payloads.push(r.value.data);
    });
    const merged = payloads.flatMap((p) => extractEventsFromPayload(p));
    const deduped = Array.from(new Map(merged.map((e) => [String(e.id), e])).values());
    setBackendEvents(deduped);
  };



  useEffect(() => {
    if (selectedEventId && !effectiveEvents.some((event) => event.id === selectedEventId)) {
      setSelectedEventId(null);
    }
  }, [effectiveEvents, selectedEventId]);

  useEffect(() => {
    if (!selectedEvent) return;

    setFormTitle(selectedEvent.title);
    setFormStartDateTime(`${selectedEvent.date}T${selectedEvent.start}`);
    setFormEndDateTime(`${selectedEvent.date}T${selectedEvent.end}`);
    setFormDescription(selectedEvent.description ?? "");

    if (selectedEvent.recurrenceRule) {
      const parsed = parseRRuleOptions(selectedEvent.recurrenceRule, new Date(selectedEvent.startEpoch));
      const nextFrequency = mapFrequencyFromRRule(parsed?.freq);
      if (nextFrequency) {
        setRecurrenceEnabled(true);
        setRecurrenceFrequency(nextFrequency);
      } else {
        setRecurrenceEnabled(true);
        setRecurrenceFrequency("WEEKLY");
      }

      setRecurrenceInterval(Math.max(1, parsed?.interval || 1));
      setRecurrenceUntil(parsed?.until ? toDateInputValue(parsed.until) : "");
    } else {
      setRecurrenceEnabled(false);
      setRecurrenceFrequency("WEEKLY");
      setRecurrenceInterval(1);
      setRecurrenceUntil("");
    }
  }, [selectedEvent]);

  // ── Grid position helpers ──────────────────────────────────────────────────

  /**
   * FIX: Shift the UTC epoch by displayOffsetMinutes, then use UTC getters
   * to read the wall-clock hours/minutes in the selected timezone.
   * Previously this used `new Date(startMs).getHours()` which reads the
   * browser's local timezone and is wrong whenever the user picks a different
   * GMT offset.
   */
  const getTopOffset = (event: CalendarEvent) => {
    if (!event.startEpoch) return 0;
    const shiftedMs = event.startEpoch + displayOffsetMinutes * 60 * 1000;
    const shifted = new Date(shiftedMs);
    const startMinutes = shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
    const baseMinutes = calendarGridFirstHour * 60;
    return ((startMinutes - baseMinutes) / 60) * calendarGridHourHeight;
  };

  /**
   * Height is derived from the absolute duration between two UTC epochs —
   * timezone-agnostic and correct regardless of offset.
   */
  const getHeight = (event: CalendarEvent) => {
    if (!event.endEpoch || !event.startEpoch) return 48;
    const durationInHours = Math.max(0, (event.endEpoch - event.startEpoch) / (1000 * 60 * 60));
    return Math.max(48, durationInHours * calendarGridHourHeight);
  };

  const isSameDay = (left: Date, right: Date) => {
    return (
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate()
    );
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setViewMonthDate(date);
  };

  const handleShift = (direction: -1 | 1) => {
    const distance = viewMode === "week" ? 7 : 1;
    const nextDate = addDays(selectedDate, direction * distance);
    setSelectedDate(nextDate);
    setViewMonthDate(nextDate);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setViewMonthDate(today);
  };

  const handleCreateEvent = () => {
    setSelectedEventId(null);
    setFormTitle("");
    setFormDescription("");
    setRecurrenceEnabled(false);
    setRecurrenceFrequency("WEEKLY");
    setRecurrenceInterval(1);
    setRecurrenceUntil("");

    const startBase = new Date(selectedDate);
    startBase.setHours(9, 0, 0, 0);
    const endBase = new Date(selectedDate);
    endBase.setHours(10, 0, 0, 0);
    setFormStartDateTime(toDateTimeLocalValue(startBase));
    setFormEndDateTime(toDateTimeLocalValue(endBase));
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEventId(event.id);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fffef6 0%, #ffffff 100%)",
        py: { xs: 2, md: 3 },
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 1, md: 2 } }}>
        <Paper
          sx={{
            borderRadius: 4,
            border: "1px solid #F6E4A5",
            overflow: "hidden",
            boxShadow: "0 12px 28px rgba(207,169,45,0.12)",
          }}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "240px 1fr 300px" } }}>
            {/* ── Left sidebar: mini calendar + incoming events ── */}
            <Box sx={{ borderRight: { lg: "1px solid #F1E4BA" }, backgroundColor: "#FFFBEC", p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: "#4A3D18" }}>
                {monthYearLabel(viewMonthDate)}
              </Typography>
              <Stack direction="row" sx={{ mb: 1, color: "#8D7A40", fontSize: 12, fontWeight: 600 }}>
                {"Su Mo Tu We Th Fr Sa".split(" ").map((day) => (
                  <Box key={day} sx={{ width: 28, textAlign: "center" }}>
                    {day}
                  </Box>
                ))}
              </Stack>

              {miniCalendar.map((week, weekIndex) => (
                <Stack key={weekIndex} direction="row" sx={{ mb: 0.5 }}>
                  {week.map((cell) => {
                    const selected = isSameDay(cell.date, selectedDate);
                    const isToday = isSameDay(cell.date, new Date());
                    return (
                      <Box
                        key={`${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`}
                        onClick={() => handleSelectDate(cell.date)}
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 1,
                          textAlign: "center",
                          lineHeight: "28px",
                          fontSize: 12,
                          color: selected ? "#3D2F00" : cell.inCurrentMonth ? "#6B5A2A" : "#B3A069",
                          fontWeight: selected ? 700 : 500,
                          backgroundColor: selected ? "#FFD84D" : "transparent",
                          border: isToday ? "1px solid #E6C655" : "1px solid transparent",
                          cursor: "pointer",
                        }}
                      >
                        {cell.date.getDate()}
                      </Box>
                    );
                  })}
                </Stack>
              ))}

              <Divider sx={{ my: 2 }} />
              <Paper
                variant="outlined"
                sx={{
                  borderColor: "#EEDFAE",
                  backgroundColor: "#FFF9DF",
                  p: 1.25,
                  borderRadius: 2,
                  maxHeight: 300,
                  overflowY: "auto",
                  mb: 1.5,
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#7A6530", letterSpacing: 0.5, mb: 1 }}>
                  INCOMING EVENTS
                </Typography>

                <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                  {incomingEventsByDay.length === 0 && (
                    <Typography sx={{ fontSize: 11, color: "#8D7A40" }}>No upcoming events</Typography>
                  )}

                  {incomingEventsByDay.map((group) => {
                    const groupDate = new Date(`${group.date}T00:00:00`);
                    const dayDiff = Math.floor(
                      (groupDate.getTime() - new Date(`${toIsoDateOffset(selectedDate)}T00:00:00`).getTime()) /
                        (1000 * 60 * 60 * 24),
                    );
                    const dayPrefix =
                      dayDiff === 0 ? "TODAY" : dayDiff === 1 ? "TOMORROW" : weekdayUpperLabel(groupDate);

                    return (
                      <Box key={group.date}>
                        <Typography
                          sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: dayDiff === 0 ? "#2C6ED6" : "#8D7A40",
                            mb: 0.5,
                          }}
                        >
                          {dayPrefix}{" "}
                          <Box component="span" sx={{ color: "#A59056", fontWeight: 500 }}>
                            {shortDateLabel(groupDate)}
                          </Box>
                        </Typography>

                        {group.events.map((event) => (
                          <ListItem key={event.id} disableGutters sx={{ py: 0.4, px: 0 }}>
                            <Stack spacing={0.25} sx={{ width: "100%" }}>
                              <Stack direction="row" alignItems="center" spacing={0.75}>
                                <Box
                                  sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    backgroundColor: incomingDotColorMap[event.tag],
                                    flexShrink: 0,
                                  }}
                                />
                                <Typography sx={{ fontSize: 11, color: "#8A7640", fontWeight: 600 }}>
                                  {toTwelveHour(event.start)} - {toTwelveHour(event.end)}
                                </Typography>
                              </Stack>
                              <Typography sx={{ fontSize: 11, color: "#4A3A12", pl: 2.2 }}>
                                {event.title}
                              </Typography>
                            </Stack>
                          </ListItem>
                        ))}
                      </Box>
                    );
                  })}
                </List>
              </Paper>
              <Button
                startIcon={<AddIcon />}
                sx={{ mt: 0, textTransform: "none", color: "#6A571A" }}
                onClick={handleCreateEvent}
              >
                Add an event
              </Button>
            </Box>

            {/* ── Center: calendar grid ── */}
            <Box sx={{ backgroundColor: "#FFFFFF", minWidth: 0 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ p: 2, borderBottom: "1px solid #F2E8C8" }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#2B2412" }}>
                  {monthYearLabel(selectedDate)}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControl size="small" sx={{ minWidth: 110 }}>
                    <Select
                      value={selectedTimezoneName}
                      onChange={(event) => {
                        const timezoneName = String(event.target.value);
                        setSelectedTimezoneName(timezoneName);

                        const timezone = getTimezone(timezoneName);
                        if (timezone) {
                          setDisplayOffsetMinutes(timezone.utcOffset);
                        }
                      }}
                      sx={{
                        height: 34,
                        borderRadius: 1.5,
                        color: "#6E591A",
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E7D28C" },
                      }}
                    >
                      {gmtOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    sx={{ borderColor: "#E7D28C", color: "#6E591A", textTransform: "none" }}
                    onClick={() => setViewMode("week")}
                  >
                    Week
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{ borderColor: "#E7D28C", color: "#6E591A", textTransform: "none" }}
                    onClick={() => setViewMode("day")}
                  >
                    Day
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#FFD84D",
                      color: "#2E250C",
                      textTransform: "none",
                      boxShadow: "none",
                    }}
                    onClick={handleToday}
                  >
                    Today
                  </Button>
                  <IconButton sx={{ border: "1px solid #EEDFAE" }} onClick={() => handleShift(-1)}>
                    <ChevronLeftIcon />
                  </IconButton>
                  <IconButton sx={{ border: "1px solid #EEDFAE" }} onClick={() => handleShift(1)}>
                    <ChevronRightIcon />
                  </IconButton>
                </Stack>
              </Stack>

              <Box sx={{ overflow: "auto", maxHeight: { xs: "65vh", lg: "calc(100vh - 220px)" } }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: `60px repeat(${visibleDates.length}, 160px)`,
                    width: "max-content",
                    minWidth: "100%",
                    minHeight: calendarGridMinHeight,
                  }}
                >
                  {/* Hour gutter */}
                  <Box
                    sx={{
                      borderRight: "1px solid #F2E8C8",
                      backgroundColor: "#FFFDF4",
                      display: "grid",
                      gridTemplateRows: calendarGridRowTemplate,
                    }}
                  >
                    <Box
                      sx={{
                        borderBottom: "1px solid #F2E8C8",
                        boxSizing: "border-box",
                        px: 1,
                        py: 1,
                      }}
                    >
                      <Typography sx={{ fontSize: 11, color: "#94804A" }}>
                        {formatGmtOffset(displayOffsetMinutes)}
                      </Typography>
                    </Box>
                    {hours.map((hour) => (
                      <Box
                        key={hour}
                        sx={{
                          borderBottom: "1px solid #F7EFCF",
                          boxSizing: "border-box",
                          px: 1,
                        }}
                      >
                        <Typography sx={{ fontSize: 11, color: "#B39A58", mt: 0.75 }}>{hour}</Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Day columns */}
                  {visibleDates.map((date, dayIndex) => (
                    <Box
                      key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                      sx={{
                        position: "relative",
                        borderRight: "1px solid #F2E8C8",
                        display: "grid",
                        gridTemplateRows: calendarGridRowTemplate,
                      }}
                    >
                      <Box
                        sx={{
                          px: 1.25,
                          py: 1,
                          borderBottom: "1px solid #F2E8C8",
                          boxSizing: "border-box",
                          backgroundColor: "#FFFEF8",
                        }}
                      >
                        <Typography sx={{ fontSize: 12, color: "#846A2B", fontWeight: 600 }}>
                          {weekdayLabel(date)}
                        </Typography>
                      </Box>

                      {hours.map((hour) => (
                        <Box
                          key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${hour}`}
                          sx={{ borderBottom: "1px solid #F7EFCF", boxSizing: "border-box" }}
                        />
                      ))}

                      {groupedByVisibleDates[dayIndex].map((event) => (
                        <Box
                          key={event.id}
                          onClick={() => handleSelectEvent(event)}
                          sx={{
                            position: "absolute",
                            left: 8,
                            right: 8,
                            top: calendarGridHeaderHeight + getTopOffset(event),
                            height: getHeight(event),
                            borderRadius: 1.5,
                            p: 1,
                            border: selectedEventId === event.id ? "1px solid #D5B13D" : "1px solid #F2D669",
                            backgroundColor: selectedEventId === event.id ? "#FFED9B" : "#FFF5C9",
                            boxShadow: selectedEventId === event.id
                              ? "0 8px 14px rgba(214,169,46,0.2)"
                              : "0 6px 12px rgba(233,186,48,0.15)",
                            cursor: "pointer",
                          }}
                        >
                          <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#4D3F15" }}>
                            {event.title}
                          </Typography>
                          <Typography sx={{ fontSize: 10, color: "#7A6730", mt: 0.2 }}>
                            {event.start} - {event.end}
                          </Typography>
                          <Chip
                            label={event.tag}
                            size="small"
                            color={chipColorMap[event.tag]}
                            sx={{ mt: 0.6, height: 18, "& .MuiChip-label": { px: 1, fontSize: 10 } }}
                          />
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* ── Right sidebar ── */}
            <Box sx={{ borderLeft: { lg: "1px solid #F1E4BA" }, backgroundColor: "#FFFDF3", p: 2 }}>
              <Paper
                variant="outlined"
                sx={{ p: 1.5, borderColor: "#EEDFAE", backgroundColor: "#FFF9DF" }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#4A3A12" }}>
                    {selectedEvent ? "Edit event" : "Create event"}
                  </Typography>
                  {selectedEvent ? (
                    <Button
                      size="small"
                      onClick={handleCreateEvent}
                      sx={{ textTransform: "none", color: "#7A6528", minWidth: 0, p: 0.25 }}
                    >
                      New
                    </Button>
                  ) : null}
                </Stack>

                <Stack spacing={1.25}>
                  <TextField
                    label="Title"
                    size="small"
                    fullWidth
                    value={formTitle}
                    onChange={(event) => setFormTitle(event.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "#FFFDF4" } }}
                  />

                  <TextField
                    label="Start time"
                    type="datetime-local"
                    size="small"
                    fullWidth
                    value={formStartDateTime}
                    onChange={(event) => setFormStartDateTime(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "#FFFDF4" } }}
                  />

                  <TextField
                    label="End time"
                    type="datetime-local"
                    size="small"
                    fullWidth
                    value={formEndDateTime}
                    onChange={(event) => setFormEndDateTime(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                    slotProps={{
                      htmlInput: {
                        min: formStartDateTime,
                        max: formEndMax,
                      }
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "#FFFDF4" } }}
                  />

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setIsRecurrenceDialogOpen(true)}
                    sx={{ borderColor: "#E2C667", color: "#6B571D", textTransform: "none", justifyContent: "space-between" }}
                  >
                    Repeat
                    <Box component="span" sx={{ color: "#8A7640", ml: 1 }}>
                      {recurrenceSummary}
                    </Box>
                  </Button>

                  <TextField
                    label="Description"
                    size="small"
                    fullWidth
                    multiline
                    minRows={4}
                    value={formDescription}
                    onChange={(event) => setFormDescription(event.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "#FFFDF4" } }}
                  />

                  <Typography sx={{ fontSize: 11, color: "#8A7640" }}>
                    {formTimezoneLabel}
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    {selectedEvent && (
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        onClick={handleDeleteEvent}
                        sx={{ textTransform: "none" }}
                      >
                        Delete
                      </Button>
                    )}
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSaveEvent}
                      disabled={!formTitle.trim()}
                      sx={{
                        backgroundColor: "#FFD84D",
                        color: "#2C2208",
                        textTransform: "none",
                        boxShadow: "none",
                      }}
                    >
                      {selectedEvent ? "Update event" : "Save event"}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>

              <Dialog
                open={isRecurrenceDialogOpen}
                onClose={() => setIsRecurrenceDialogOpen(false)}
                fullWidth
                maxWidth="xs"
              >
                <DialogTitle sx={{ fontWeight: 700, color: "#4A3A12" }}>Edit recurrence</DialogTitle>
                <DialogContent sx={{ pt: 1.5 }}>
                  <Stack spacing={2} sx={{ pt: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={recurrenceEnabled}
                          onChange={(event) => setRecurrenceEnabled(event.target.checked)}
                        />
                      }
                      label="Repeat event"
                    />

                    <FormControl size="small" fullWidth disabled={!recurrenceEnabled}>
                      <InputLabel id="recurrence-frequency-label">Frequency</InputLabel>
                      <Select
                        labelId="recurrence-frequency-label"
                        value={recurrenceFrequency}
                        label="Frequency"
                        onChange={(event) =>
                          setRecurrenceFrequency(event.target.value as "DAILY" | "WEEKLY" | "MONTHLY")
                        }
                      >
                        <MenuItem value="DAILY">Daily</MenuItem>
                        <MenuItem value="WEEKLY">Weekly</MenuItem>
                        <MenuItem value="MONTHLY">Monthly</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label="Repeat every"
                      type="number"
                      size="small"
                      fullWidth
                      disabled={!recurrenceEnabled}
                      value={recurrenceInterval}
                      onChange={(event) => {
                        const nextValue = Number(event.target.value);
                        setRecurrenceInterval(Number.isNaN(nextValue) ? 1 : Math.max(1, Math.floor(nextValue)));
                      }}
                      inputProps={{ min: 1 }}
                    />

                    <TextField
                      label="Until"
                      type="date"
                      size="small"
                      fullWidth
                      disabled={!recurrenceEnabled}
                      value={recurrenceUntil}
                      onChange={(event) => setRecurrenceUntil(event.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                  <Button onClick={() => setIsRecurrenceDialogOpen(false)} sx={{ textTransform: "none" }}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ textTransform: "none", backgroundColor: "#FFD84D", color: "#2C2208", boxShadow: "none" }}
                    onClick={() => setIsRecurrenceDialogOpen(false)}
                  >
                    Apply
                  </Button>
                </DialogActions>
              </Dialog>


              <Dialog
                open={recurringActionDialog?.open ?? false}
                onClose={() => setRecurringActionDialog(null)}
                maxWidth="xs"
                fullWidth
              >
                <DialogTitle sx={{ fontWeight: 700, color: "#4A3A12" }}>
                  {recurringActionDialog?.mode === "delete" ? "Delete recurring event" : "Edit recurring event"}
                </DialogTitle>

                <DialogContent>
                  <Stack spacing={1} sx={{ pt: 0.5 }}>
                    {recurringActionDialog?.mode === "edit" ? (
                      <>
                        <Button
                          fullWidth variant="outlined"
                          sx={{ textTransform: "none", justifyContent: "flex-start" }}
                          onClick={() => executeSave("this")}
                        >
                          This event only
                        </Button>
                        <Button
                          fullWidth variant="outlined"
                          sx={{ textTransform: "none", justifyContent: "flex-start" }}
                          onClick={() => executeSave("thisAndFollowing")}
                        >
                          This and following events
                        </Button>
                        <Button
                          fullWidth variant="outlined"
                          sx={{ textTransform: "none", justifyContent: "flex-start" }}
                          onClick={() => executeSave("all")}
                        >
                          All events
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          fullWidth variant="outlined" color="error"
                          sx={{ textTransform: "none", justifyContent: "flex-start" }}
                          onClick={() => executeDelete("this")}
                        >
                          This event only
                        </Button>
                        <Button
                          fullWidth variant="outlined" color="error"
                          sx={{ textTransform: "none", justifyContent: "flex-start" }}
                          onClick={() => executeDelete("all")}
                        >
                          All events
                        </Button>
                      </>
                    )}
                  </Stack>
                </DialogContent>

                <DialogActions>
                  <Button onClick={() => setRecurringActionDialog(null)} sx={{ textTransform: "none" }}>
                    Cancel
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}