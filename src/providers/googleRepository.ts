import type { PlannerItem } from '../domain/types'
import { decodeCalendarMetadata, encodeCalendarMetadata } from '../lib/calendarMetadata'
import { isGoogleEventOwned, toGoogleEvent, type GoogleCalendarEvent } from '../lib/googleCalendar'
import type { CalendarDescriptor, CalendarRepository, CalendarSession } from './calendar'
import { startOfWeek } from '../domain/date'

type GoogleEventsResponse = { items?: GoogleCalendarEvent[] }
type GoogleCalendarListResponse = { items?: Array<{ id: string; summary: string; primary?: boolean; accessRole?: string }> }

export class GoogleCalendarRepository implements CalendarRepository {
  constructor(private readonly getSession: () => CalendarSession | null) {}

  private async request<T>(url: string, init: RequestInit = {}): Promise<T> {
    const session = this.getSession()
    if (!session || session.expiresAt <= Date.now()) throw new Error('Google session is missing or expired.')
    const response = await fetch(url, { ...init, headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) } })
    if (!response.ok) throw new Error(`Google Calendar request failed (${response.status}).`)
    return response.status === 204 ? undefined as T : response.json() as Promise<T>
  }

  async listCalendars(): Promise<CalendarDescriptor[]> {
    const payload = await this.request<GoogleCalendarListResponse>('https://www.googleapis.com/calendar/v3/users/me/calendarList')
    return (payload.items ?? []).map(({ id, summary, primary, accessRole }) => ({ id, summary, primary, accessRole }))
  }

  async listItems(calendarId: string, timeMin: string, timeMax: string): Promise<PlannerItem[]> {
    const params = new URLSearchParams({ singleEvents: 'true', orderBy: 'startTime', timeMin, timeMax, maxResults: '2500' })
    const payload = await this.request<GoogleEventsResponse>(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`)
    return (payload.items ?? []).map((event, index) => this.fromGoogle(event, index)).filter(Boolean) as PlannerItem[]
  }

  async createItem(calendarId: string, item: PlannerItem) { const event = await this.request<GoogleCalendarEvent>(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, { method: 'POST', body: JSON.stringify(this.toGoogle(item)) }); return this.fromGoogle(event, item.day) ?? item }
  async updateItem(calendarId: string, item: PlannerItem) { if (!item.googleEventId) throw new Error('Cannot update without Google event ID.'); const event = await this.request<GoogleCalendarEvent>(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(item.googleEventId)}`, { method: 'PATCH', headers: item.providerEtag ? { 'If-Match': item.providerEtag } : undefined, body: JSON.stringify(this.toGoogle(item)) }); return this.fromGoogle(event, item.day) ?? item }
  async deleteManagedItem(calendarId: string, item: PlannerItem) { if (!item.managed || !item.googleEventId) throw new Error('Refusing to delete an unmarked or unsynced event.'); await this.request<void>(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(item.googleEventId)}`, { method: 'DELETE', headers: item.providerEtag ? { 'If-Match': item.providerEtag } : undefined }) }

  private toGoogle(item: PlannerItem) {
    const description = `${stripMetadata(item.note ?? '')}${encodeCalendarMetadata({ plannerId: item.id, kind: item.kind, owner: item.owner, category: item.category, status: item.status, recurrence: item.recurrence, importance: item.importance, linkedTaskId: item.linkedTaskId, effortMinutes: item.effortMinutes })}`
    const date = item.date ?? dayDate(item.day)
    const next = new Date(`${date}T12:00:00`); next.setDate(next.getDate() + 1)
    const start = item.start ? `${date}T${item.start}:00` : undefined
    const end = item.end ? `${date}T${item.end}:00` : undefined
    return toGoogleEvent({ id: item.id, title: item.title, description, start, end, date, nextDate: next.toISOString().slice(0, 10) })
  }

  private fromGoogle(event: GoogleCalendarEvent, fallbackDay: number): PlannerItem | null {
    if (!event.id) return null
    const metadata = decodeCalendarMetadata(event.description ?? '')
    const date = event.start.date ?? event.start.dateTime?.slice(0, 10)
    return { id: metadata?.plannerId ?? `google-${event.id}`, googleEventId: event.id, kind: metadata?.kind ?? 'event', title: event.summary, date, day: date ? dayIndex(date) : fallbackDay, start: event.start.dateTime?.slice(11, 16), end: event.end.dateTime?.slice(11, 16), owner: metadata?.owner ?? 'Unassigned', category: (metadata?.category ?? 'Other') as PlannerItem['category'], status: (metadata?.status ?? 'approved') as PlannerItem['status'], recurrence: metadata?.recurrence ?? 'one-off', importance: metadata?.importance ?? 'normal', note: stripMetadata(event.description ?? ''), effortMinutes: metadata?.effortMinutes, linkedTaskId: metadata?.linkedTaskId, managed: isGoogleEventOwned(event), providerUpdatedAt: event.updated, providerEtag: event.etag }
  }
}

function dayDate(day: number) {
  const date = startOfWeek()
  date.setDate(date.getDate() + day)
  return date.toISOString().slice(0, 10)
}

function dayIndex(date: string) {
  return Math.max(0, Math.min(6, Math.round((new Date(`${date}T12:00:00`).getTime() - startOfWeek().getTime()) / 86400000)))
}

function stripMetadata(description: string) {
  return description.replace(/\n*--- FAMILY PLANNER METADATA ---[\s\S]*?--- END FAMILY PLANNER METADATA ---/g, '').trim()
}
