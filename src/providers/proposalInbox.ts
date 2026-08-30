import type { CalendarSession } from './calendar'
import type { PlannerItem } from '../domain/types'
import { validateWeeklyPlan, type ImportedProposal } from '../lib/imports'

type GoogleEvent = { id?: string; summary?: string; description?: string; start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string } }

export function decodeProposalEvent(description = '') {
  const match = description.match(/--- FAMILY PLANNER PROPOSAL ---\s*([\s\S]*?)\s*--- END FAMILY PLANNER PROPOSAL ---/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[1]) as { marker?: string; version?: string; request_id?: string; external_id?: string; proposal?: ImportedProposal }
    if (parsed.marker !== 'X-FAMILY-PLANNER-PROPOSAL' || parsed.version !== '1.0' || !parsed.proposal) return null
    return parsed
  } catch {
    return null
  }
}

export function proposalToPlannerItem(event: GoogleEvent, index = 0): PlannerItem | null {
  const wrapper = decodeProposalEvent(event.description)
  if (!wrapper || !wrapper.proposal) return null
  const proposal: ImportedProposal = wrapper.proposal
  return {
    id: `proposal-${proposal.external_id}`,
    googleEventId: event.id,
    kind: proposal.type === 'task' ? 'task' : 'event',
    title: proposal.title ?? event.summary?.replace(/^\[PROPOSAL\]\s*/, '') ?? proposal.type,
    day: index % 7,
    start: proposal.type === 'task' ? undefined : proposal.start?.slice(11, 16),
    end: proposal.type === 'task' ? undefined : proposal.end?.slice(11, 16),
    owner: proposal.suggested_assignee === 'organizer_1' ? 'Paolo' : proposal.suggested_assignee === 'organizer_2' ? 'Anna' : proposal.suggested_assignee === 'both' ? 'Both' : 'Unassigned',
    category: proposal.type === 'task' ? 'Task' : proposal.source === 'school' ? 'School' : proposal.type.startsWith('work_') ? 'Work' : 'Family',
    status: 'proposed',
    recurrence: 'one-off',
    importance: proposal.priority ?? 'normal',
    note: proposal.reason,
    managed: true,
  }
}

export class GoogleProposalInbox {
  constructor(private readonly getSession: () => CalendarSession | null) {}
  async list(calendarId: string): Promise<PlannerItem[]> {
    const session = this.getSession()
    if (!session || session.expiresAt <= Date.now()) throw new Error('Google session is missing or expired.')
    const params = new URLSearchParams({ singleEvents: 'true', orderBy: 'startTime', timeMin: new Date(Date.now() - 7 * 86400000).toISOString(), maxResults: '500' })
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`, { headers: { Authorization: `Bearer ${session.accessToken}` } })
    if (!response.ok) throw new Error(`Proposal calendar read failed (${response.status}).`)
    const payload = await response.json() as { items?: GoogleEvent[] }
    return (payload.items ?? []).map(proposalToPlannerItem).filter(Boolean) as PlannerItem[]
  }

  async delete(calendarId: string, eventId: string) {
    const session = this.getSession()
    if (!session || session.expiresAt <= Date.now()) throw new Error('Google session is missing or expired.')
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${session.accessToken}` } })
    if (!response.ok && response.status !== 410) throw new Error(`Proposal cleanup failed (${response.status}).`)
  }
}

export function validateBridgePayload(payload: unknown) { return validateWeeklyPlan(payload) }
