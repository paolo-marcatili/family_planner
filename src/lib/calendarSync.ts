import { FAMILY_PLANNER_MARKER, encodeCalendarMetadata } from './calendarMetadata'

export type CalendarTarget = 'shared' | 'work'
export type SyncFilter = { startDay?: number; endDay?: number; category?: string; owner?: string; managedOnly?: boolean }
export type SyncEvent = { id: string; title: string; day: number; start?: string; end?: string; category: string; owner: string; status: string; managed?: boolean; note?: string }

export function filterSyncEvents(events: SyncEvent[], filter: SyncFilter = {}) {
  return events.filter((event) => {
    if (filter.managedOnly && !event.managed) return false
    if (filter.startDay !== undefined && event.day < filter.startDay) return false
    if (filter.endDay !== undefined && event.day > filter.endDay) return false
    if (filter.category && event.category !== filter.category) return false
    if (filter.owner && event.owner !== filter.owner) return false
    return event.status === 'approved' || event.status === 'done'
  })
}

export function toCalendarWrite(event: SyncEvent, target: CalendarTarget) {
  return {
    target,
    externalId: event.id,
    title: event.title,
    description: encodeCalendarMetadata({ plannerId: event.id, kind: 'event', owner: event.owner as 'Paolo' | 'Anna' | 'Both' | 'Unassigned', category: event.category, status: event.status, recurrence: 'one-off' }),
    marker: FAMILY_PLANNER_MARKER,
    start: event.start,
    end: event.end,
  }
}

export function bulkRemovalPreview(events: SyncEvent[], filter: SyncFilter = {}) {
  return filterSyncEvents(events, { ...filter, managedOnly: true }).map((event) => ({ id: event.id, title: event.title, day: event.day }))
}
