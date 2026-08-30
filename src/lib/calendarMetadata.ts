export const FAMILY_PLANNER_MARKER = 'X-FAMILY-PLANNER'
export const FAMILY_PLANNER_METADATA_VERSION = '1.0'

export type CalendarEventMetadata = {
  marker: typeof FAMILY_PLANNER_MARKER
  version: typeof FAMILY_PLANNER_METADATA_VERSION
  plannerId: string
  kind: 'event' | 'task'
  owner: 'Paolo' | 'Anna' | 'Both' | 'Unassigned'
  category: string
  status: string
  recurrence: 'one-off' | 'weekly'
  importance?: 'critical' | 'important' | 'normal' | 'low'
  linkedTaskId?: string
  effortMinutes?: number
}

/** JSON kept in a reserved description block in calendar-authoritative mode. */
export function encodeCalendarMetadata(metadata: Omit<CalendarEventMetadata, 'marker' | 'version'>) {
  return `\n\n--- FAMILY PLANNER METADATA ---\n${JSON.stringify({ marker: FAMILY_PLANNER_MARKER, version: FAMILY_PLANNER_METADATA_VERSION, ...metadata })}\n--- END FAMILY PLANNER METADATA ---`
}

export function decodeCalendarMetadata(description: string): CalendarEventMetadata | null {
  const match = description.match(/--- FAMILY PLANNER METADATA ---\s*([\s\S]*?)\s*--- END FAMILY PLANNER METADATA ---/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[1]) as CalendarEventMetadata
    return parsed.marker === FAMILY_PLANNER_MARKER && parsed.version === FAMILY_PLANNER_METADATA_VERSION ? parsed : null
  } catch {
    return null
  }
}

export function isFamilyPlannerEvent(description: string) {
  return decodeCalendarMetadata(description) !== null
}
