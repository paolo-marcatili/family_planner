import type { PlannerItem } from '../domain/types'

export type CalendarDescriptor = { id: string; summary: string; primary?: boolean; accessRole?: string }
export type CalendarSession = { accessToken: string; expiresAt: number; email?: string }

export interface CalendarRepository {
  listCalendars(): Promise<CalendarDescriptor[]>
  listItems(calendarId: string, timeMin: string, timeMax: string): Promise<PlannerItem[]>
  createItem(calendarId: string, item: PlannerItem): Promise<PlannerItem>
  updateItem(calendarId: string, item: PlannerItem): Promise<PlannerItem>
  deleteManagedItem(calendarId: string, item: PlannerItem): Promise<void>
}

export interface CalendarAuthProvider {
  connect(): Promise<CalendarSession>
  disconnect(): Promise<void>
  session(): CalendarSession | null
}
