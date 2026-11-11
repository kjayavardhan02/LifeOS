import {
  addDays,
  addHours,
  setHours,
  setMinutes,
  setSeconds,
  nextMonday,
  nextTuesday,
  nextWednesday,
  nextThursday,
  nextFriday,
  nextSaturday,
  nextSunday,
  startOfDay,
  isMonday,
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
  isSaturday,
  isSunday,
} from 'date-fns';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { taskService } from '../tasks/task.service.js';
import { transactionService } from '../finance/transaction.service.js';
import { knowledgeService } from '../knowledge/knowledge.service.js';
import { reminderService } from '../reminders/reminder.service.js';
import { eventService } from '../calendar/event.service.js';

type QuickCaptureType = 'task' | 'expense' | 'note' | 'reminder' | 'event';

interface ParseResult {
  type: QuickCaptureType;
  confidence: number;
  parsed: Record<string, unknown>;
  preview: string;
}

// ── Heuristic patterns ──

const CURRENCY_REGEX = /(?:^|\s)(?:₹|rs\.?|inr|\$|usd)\s*\d+|\d+\s*(?:₹|rs\.?|inr|\$|usd)/i;
const AMOUNT_LEADING_REGEX = /^(\d+(?:\.\d{1,2})?)\s+/;
const AMOUNT_ANYWHERE_REGEX = /(?:₹|rs\.?|inr|\$|usd)\s*(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(?:₹|rs\.?|inr|\$|usd)/i;
const EXPENSE_WORDS = /\b(spent|paid|bought|cost|expense|charged|bill|billed|payment)\b/i;

const REMINDER_WORDS = /\b(remind|reminder|tomorrow|tonight|at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?|by\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|morning|evening)\b/i;

const EVENT_WORDS = /\b(meeting|event|appointment|call\s+with|lunch\s+with|dinner\s+with|session|standup|sync)\b/i;
const TIME_DATE_WORDS = /\b(today|tomorrow|tonight|morning|evening|at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i;

const NOTE_PREFIX = /^(?:note|idea|thought|remember\s+that)\s*[:\-]?\s*/i;

const ACTION_VERBS = /^(buy|fix|send|complete|submit|review|finish|do|check|clean|update|prepare|make|call|email|write|schedule|cancel|renew|organize|set\s+up|follow\s+up|plan|research|book|order|return|pay|pick\s+up|drop\s+off)\b/i;
const TODO_PHRASES = /\b(need\s+to|have\s+to|should|must|don't\s+forget|todo|to\s+do)\b/i;

// ── Known expense categories ──

const EXPENSE_CATEGORIES: Record<string, string[]> = {
  Food: ['food', 'zomato', 'swiggy', 'restaurant', 'cafe', 'coffee', 'tea', 'lunch', 'dinner', 'breakfast', 'snack', 'biryani', 'pizza', 'burger', 'groceries', 'grocery', 'milk', 'bread', 'fruits', 'vegetables'],
  Transport: ['uber', 'ola', 'cab', 'auto', 'rickshaw', 'metro', 'bus', 'train', 'petrol', 'diesel', 'fuel', 'parking', 'toll', 'flight', 'ticket'],
  Shopping: ['amazon', 'flipkart', 'myntra', 'shopping', 'clothes', 'shoes', 'electronics'],
  Entertainment: ['movie', 'netflix', 'spotify', 'game', 'concert', 'show'],
  Health: ['medicine', 'doctor', 'hospital', 'pharmacy', 'gym', 'health'],
  Bills: ['electricity', 'water', 'internet', 'wifi', 'phone', 'mobile', 'recharge', 'rent'],
  Education: ['book', 'course', 'class', 'tuition', 'udemy', 'coursera'],
};

function matchExpenseCategory(words: string[]): string {
  const lowerWords = words.map((w) => w.toLowerCase());
  for (const [category, keywords] of Object.entries(EXPENSE_CATEGORIES)) {
    for (const word of lowerWords) {
      if (keywords.includes(word)) return category;
    }
  }
  return 'Other';
}

// ── Date/time parsing ──

function resolveRelativeDate(input: string): Date | null {
  const now = new Date();
  const lower = input.toLowerCase().trim();

  if (/\btomorrow\b/.test(lower)) {
    return startOfDay(addDays(now, 1));
  }
  if (/\btoday\b/.test(lower)) {
    return startOfDay(now);
  }
  if (/\btonight\b/.test(lower)) {
    return setHours(setMinutes(setSeconds(startOfDay(now), 0), 0), 21);
  }
  if (/\bmorning\b/.test(lower)) {
    const base = /\btomorrow\b/.test(lower) ? addDays(now, 1) : now;
    return setHours(setMinutes(setSeconds(startOfDay(base), 0), 0), 9);
  }
  if (/\bevening\b/.test(lower)) {
    const base = /\btomorrow\b/.test(lower) ? addDays(now, 1) : now;
    return setHours(setMinutes(setSeconds(startOfDay(base), 0), 0), 18);
  }

  // Day-of-week matching
  const dayMap: Record<string, (date: Date) => Date> = {
    monday: (d) => (isMonday(d) ? addDays(d, 7) : nextMonday(d)),
    tuesday: (d) => (isTuesday(d) ? addDays(d, 7) : nextTuesday(d)),
    wednesday: (d) => (isWednesday(d) ? addDays(d, 7) : nextWednesday(d)),
    thursday: (d) => (isThursday(d) ? addDays(d, 7) : nextThursday(d)),
    friday: (d) => (isFriday(d) ? addDays(d, 7) : nextFriday(d)),
    saturday: (d) => (isSaturday(d) ? addDays(d, 7) : nextSaturday(d)),
    sunday: (d) => (isSunday(d) ? addDays(d, 7) : nextSunday(d)),
  };

  for (const [dayName, getNext] of Object.entries(dayMap)) {
    if (new RegExp(`\\b${dayName}\\b`, 'i').test(lower)) {
      return setHours(setMinutes(setSeconds(startOfDay(getNext(now)), 0), 0), 9);
    }
  }

  return null;
}

function extractTime(input: string): { hours: number; minutes: number } | null {
  // Match patterns like "at 5pm", "at 5:30pm", "at 17:00", "5pm", "5:30 PM"
  const timeMatch = input.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const period = timeMatch[3].toLowerCase();

    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    return { hours, minutes };
  }

  // 24-hour format: "at 17:00"
  const time24Match = input.match(/(?:at\s+)(\d{1,2}):(\d{2})/);
  if (time24Match) {
    return {
      hours: parseInt(time24Match[1], 10),
      minutes: parseInt(time24Match[2], 10),
    };
  }

  return null;
}

function resolveDateTime(input: string): Date {
  const now = new Date();
  const resolved = resolveRelativeDate(input);
  let date: Date = resolved ?? startOfDay(addDays(now, 1));
  const time = extractTime(input);

  if (time) {
    date = setHours(setMinutes(setSeconds(date, 0), time.minutes), time.hours);
  } else if (date.getHours() === 0 && date.getMinutes() === 0) {
    // Default to 9am if no specific time
    date = setHours(date, 9);
  }

  return date;
}

// ── Strip temporal/location words from title ──

function stripDateTimeWords(input: string): string {
  return input
    .replace(/\b(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/gi, '')
    .replace(/\b(?:today|tomorrow|tonight|morning|evening)\b/gi, '')
    .replace(/\b(?:by|on|next)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '')
    .replace(/\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '')
    .replace(/\b(?:remind|remind\s+me|reminder)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function stripLocationPhrase(input: string): { title: string; location: string | null } {
  const atMatch = input.match(/\bat\s+(?![\d])([\w\s]+)$/i);
  const withMatch = input.match(/\bwith\s+([\w\s]+)$/i);

  let title = input;
  let location: string | null = null;

  if (atMatch) {
    // "at" followed by non-numeric likely a location
    location = atMatch[1].trim();
    title = input.slice(0, atMatch.index).trim();
  }

  // "with X" for event context — keep in title but extract
  if (withMatch && !location) {
    // Keep "with X" in the title for events
  }

  return { title, location };
}

// ── Detection logic ──

function detectType(input: string): { type: QuickCaptureType; confidence: number } {
  const trimmed = input.trim();

  // Note: explicit prefix check first
  if (NOTE_PREFIX.test(trimmed)) {
    return { type: 'note', confidence: 0.95 };
  }

  // Expense: starts with a number or has currency markers
  const hasLeadingNumber = AMOUNT_LEADING_REGEX.test(trimmed);
  const hasCurrencyMarker = CURRENCY_REGEX.test(trimmed);
  const hasExpenseWord = EXPENSE_WORDS.test(trimmed);

  if (hasCurrencyMarker || (hasLeadingNumber && !REMINDER_WORDS.test(trimmed) && !EVENT_WORDS.test(trimmed))) {
    return { type: 'expense', confidence: hasCurrencyMarker ? 0.95 : 0.85 };
  }
  if (hasExpenseWord && hasLeadingNumber) {
    return { type: 'expense', confidence: 0.8 };
  }

  // Event: event words + time/date indicator
  const hasEventWords = EVENT_WORDS.test(trimmed);
  const hasTimeDate = TIME_DATE_WORDS.test(trimmed);

  if (hasEventWords && hasTimeDate) {
    return { type: 'event', confidence: 0.9 };
  }
  if (hasEventWords) {
    return { type: 'event', confidence: 0.7 };
  }

  // Reminder: has reminder-specific words
  if (REMINDER_WORDS.test(trimmed)) {
    return { type: 'reminder', confidence: 0.85 };
  }

  // Task: action verbs or todo phrases (default fallback)
  if (ACTION_VERBS.test(trimmed) || TODO_PHRASES.test(trimmed)) {
    return { type: 'task', confidence: 0.8 };
  }

  // Default fallback: task
  return { type: 'task', confidence: 0.5 };
}

// ── Parsing by type ──

function parseExpense(input: string): Record<string, unknown> {
  const trimmed = input.trim();
  let amount = 0;
  let remaining = trimmed;

  // Try leading number first
  const leadingMatch = trimmed.match(AMOUNT_LEADING_REGEX);
  if (leadingMatch) {
    amount = parseFloat(leadingMatch[1]);
    remaining = trimmed.slice(leadingMatch[0].length).trim();
  } else {
    // Try currency marker patterns
    const currencyMatch = trimmed.match(AMOUNT_ANYWHERE_REGEX);
    if (currencyMatch) {
      amount = parseFloat(currencyMatch[1] || currencyMatch[2]);
      remaining = trimmed.replace(AMOUNT_ANYWHERE_REGEX, '').trim();
    }
  }

  // Remove expense trigger words from remaining
  remaining = remaining
    .replace(EXPENSE_WORDS, '')
    .replace(/[₹$]/g, '')
    .replace(/\brs\.?\b/gi, '')
    .replace(/\binr\b/gi, '')
    .replace(/\busd\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const words = remaining.split(/\s+/).filter(Boolean);
  const category = matchExpenseCategory(words);

  // First word after amount that matches a category keyword is category hint;
  // remaining words become merchant
  let merchant: string | null = null;
  const nonCategoryWords: string[] = [];
  let foundCategory = false;

  for (const word of words) {
    const isCategory = Object.values(EXPENSE_CATEGORIES).some((kws) =>
      kws.includes(word.toLowerCase()),
    );
    if (isCategory && !foundCategory) {
      foundCategory = true;
      // skip, already captured in category
    } else {
      nonCategoryWords.push(word);
    }
  }

  if (nonCategoryWords.length > 0) {
    merchant = nonCategoryWords.join(' ');
  }

  return {
    amount,
    type: 'expense',
    date: new Date().toISOString(),
    category,
    paymentMethod: 'UPI',
    ...(merchant ? { merchant } : {}),
  };
}

function parseTask(input: string): Record<string, unknown> {
  return {
    title: input.trim(),
    priority: 'medium',
    status: 'todo',
  };
}

function parseNote(input: string): Record<string, unknown> {
  const stripped = input.replace(NOTE_PREFIX, '').trim();
  return {
    title: stripped || input.trim(),
    content: '',
    tags: [],
  };
}

function parseReminder(input: string): Record<string, unknown> {
  const dateTime = resolveDateTime(input);
  const title = stripDateTimeWords(input).replace(/^me\s+/i, '').trim() || input.trim();

  return {
    title,
    dueDate: dateTime.toISOString(),
    priority: 'medium',
  };
}

function parseEvent(input: string): Record<string, unknown> {
  const dateTime = resolveDateTime(input);
  const endDate = addHours(dateTime, 1);
  const cleaned = stripDateTimeWords(input);
  const { title, location } = stripLocationPhrase(cleaned);

  return {
    title: title || input.trim(),
    startDate: dateTime.toISOString(),
    endDate: endDate.toISOString(),
    ...(location ? { location } : {}),
  };
}

function generatePreview(type: QuickCaptureType, parsed: Record<string, unknown>): string {
  switch (type) {
    case 'expense': {
      const amt = parsed.amount as number;
      const cat = parsed.category as string;
      const merchant = parsed.merchant as string | undefined;
      return `Expense: ${amt} in ${cat}${merchant ? ` (${merchant})` : ''}`;
    }
    case 'task':
      return `Task: ${parsed.title as string}`;
    case 'note':
      return `Note: ${parsed.title as string}`;
    case 'reminder': {
      const due = new Date(parsed.dueDate as string);
      return `Reminder: ${parsed.title as string} — due ${due.toLocaleString()}`;
    }
    case 'event': {
      const start = new Date(parsed.startDate as string);
      const loc = parsed.location as string | undefined;
      return `Event: ${parsed.title as string} on ${start.toLocaleString()}${loc ? ` at ${loc}` : ''}`;
    }
    default:
      return `${type}: ${String(parsed.title || '')}`;
  }
}

// ── Public service ──

export const quickCaptureService = {
  parseInput(raw: string, overrideType?: QuickCaptureType): ParseResult {
    const detected = detectType(raw);
    const type = overrideType ?? detected.type;
    const confidence = overrideType ? 1 : detected.confidence;

    let parsed: Record<string, unknown>;
    switch (type) {
      case 'expense':
        parsed = parseExpense(raw);
        break;
      case 'task':
        parsed = parseTask(raw);
        break;
      case 'note':
        parsed = parseNote(raw);
        break;
      case 'reminder':
        parsed = parseReminder(raw);
        break;
      case 'event':
        parsed = parseEvent(raw);
        break;
      default:
        parsed = parseTask(raw);
    }

    return {
      type,
      confidence,
      parsed,
      preview: generatePreview(type, parsed),
    };
  },

  async capture(raw: string, overrideType?: QuickCaptureType) {
    const parseResult = this.parseInput(raw, overrideType);
    const { type, parsed } = parseResult;
    let createdItemId: string | null = null;

    switch (type) {
      case 'task': {
        const task = await taskService.create({
          title: parsed.title as string,
          priority: (parsed.priority as 'medium') || undefined,
        });
        createdItemId = task.id;
        break;
      }
      case 'expense': {
        const transaction = await transactionService.create({
          amount: parsed.amount as number,
          type: 'expense',
          date: parsed.date as string,
          category: parsed.category as string,
          paymentMethod: (parsed.paymentMethod as string) || undefined,
          merchant: (parsed.merchant as string) || undefined,
        });
        createdItemId = transaction.id;
        break;
      }
      case 'note': {
        const note = await knowledgeService.createQuickNote({
          title: parsed.title as string,
          content: (parsed.content as string) || undefined,
          tags: (parsed.tags as string[]) || [],
        });
        createdItemId = note.id;
        break;
      }
      case 'reminder': {
        const reminder = await reminderService.create({
          title: parsed.title as string,
          dueDate: parsed.dueDate as string,
          priority: (parsed.priority as 'medium') || undefined,
        });
        createdItemId = reminder.id;
        break;
      }
      case 'event': {
        const event = await eventService.create({
          title: parsed.title as string,
          startDate: parsed.startDate as string,
          endDate: parsed.endDate as string,
          location: (parsed.location as string) || undefined,
        });
        createdItemId = event.id;
        break;
      }
    }

    // Log to quick_captures table
    const detectedType = detectType(raw).type;
    const capture = await prisma.quickCapture.create({
      data: {
        rawInput: raw,
        detectedType,
        resolvedType: type,
        createdItemId,
        parsedData: parsed as Prisma.InputJsonValue,
      },
    });

    return {
      ...capture,
      parsedData: capture.parsedData as Record<string, unknown> | null,
      preview: parseResult.preview,
    };
  },

  async getRecent(limit: number) {
    const data = await prisma.quickCapture.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return {
      data: data.map((d) => ({
        ...d,
        parsedData: d.parsedData as Record<string, unknown> | null,
      })),
    };
  },

  async deleteCapture(id: string) {
    await prisma.quickCapture.delete({ where: { id } });
  },
};
