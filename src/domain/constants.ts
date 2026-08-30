import type { Category, Owner, PlannerForm, PlannerItem, PromptLibrary } from './types'

export const OWNERS: Owner[] = ['Paolo', 'Anna', 'Both', 'Unassigned']
export const CATEGORIES: Category[] = ['School', 'Childcare', 'Activity', 'Appointment', 'Family', 'Work', 'Travel', 'Task', 'Other']
export const IMPORTANCES = ['critical', 'important', 'normal', 'low'] as const
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const DATES = ['Sep 7', 'Sep 8', 'Sep 9', 'Sep 10', 'Sep 11', 'Sep 12', 'Sep 13']
export const HOURS = Array.from({ length: 13 }, (_, index) => `${String(index + 7).padStart(2, '0')}:00`)
export const COLORS = ['#5c9bc2', '#d49754', '#70a896', '#8d79ba', '#9ba9b6', '#d1b467', '#7d9b8e', '#c47d78', '#a29bb8']
export const WEATHER_ICONS: Record<number, string> = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️', 55: '🌧️', 61: '🌧️', 63: '🌧️', 65: '🌧️', 71: '🌨️', 73: '🌨️', 75: '❄️', 80: '🌦️', 81: '🌦️', 82: '⛈️', 95: '⛈️' }

export const EMPTY_FORM: PlannerForm = { kind: 'event', title: '', day: 0, start: '09:00', end: '10:00', owner: 'Unassigned', category: 'Family', recurrence: 'one-off', importance: 'normal', people: '', note: '' }

export const DEMO_ITEMS: PlannerItem[] = [
  { id: 'dropoff', kind: 'event', title: 'School drop-off', day: 0, start: '08:00', end: '08:30', owner: 'Anna', category: 'School', status: 'approved', recurrence: 'weekly', importance: 'important', managed: true, effortMinutes: 30 },
  { id: 'focus', kind: 'event', title: 'Online · listen only', day: 0, start: '10:00', end: '11:00', owner: 'Paolo', category: 'Work', status: 'approved', recurrence: 'one-off', importance: 'normal', note: 'Obfuscated work annotation', managed: true },
  { id: 'pickup', kind: 'event', title: 'School pickup', day: 1, start: '15:30', end: '16:00', owner: 'Unassigned', category: 'Childcare', status: 'proposed', recurrence: 'weekly', importance: 'important', people: 'Children', note: 'Needs organizer decision', managed: true, effortMinutes: 30 },
  { id: 'school-reply', kind: 'task', title: 'Reply to school message', day: 1, owner: 'Paolo', category: 'Task', status: 'approved', recurrence: 'one-off', importance: 'important', managed: true, effortMinutes: 15 },
  { id: 'activity', kind: 'event', title: 'Activity drop-off', day: 3, start: '17:00', end: '17:30', owner: 'Anna', category: 'Activity', status: 'approved', recurrence: 'weekly', importance: 'normal', managed: true, effortMinutes: 30 },
  { id: 'shopping', kind: 'task', title: 'Add weekend items to list', day: 4, owner: 'Both', category: 'Task', status: 'done', recurrence: 'one-off', importance: 'normal', managed: true, effortMinutes: 20 },
]

export const DEFAULT_PROMPTS: PromptLibrary = {
  weekly: `Prepare a Family Planner weekly/long-term proposal for the next {{HORIZON_DAYS}} days. Treat the shared family calendar as authoritative. Preserve accepted events and assignments unless a real conflict requires a proposed change. Return JSON Schema 1.0 proposals with stable external_id, source, suggested owner, importance, reason, and confidence. Do not auto-approve or include raw emails, raw calendar payloads, feed URLs, credentials, or confidential meeting details.\n\nCondensed summary:\n{{CONDENSED_SUMMARY}}`,
  incremental: `Handle an incremental Family Planner update. Consider only {{CHANGED_ITEMS}} and their local impact window. Preserve unrelated accepted events, duties, and assignments. Return only affected JSON Schema 1.0 additions, conflicts, or reassignment proposals. Do not regenerate the full week or auto-approve.\n\nAffected duties:\n{{AFFECTED_DUTIES}}`,
  urgent: `Handle this same-day or next-day change: {{URGENT_CHANGE}}. Preserve everything else. Return the smallest necessary JSON Schema 1.0 proposal with alternatives and reasons. Require explicit organizer approval for reassignment and exclude raw/private source content.`,
}
