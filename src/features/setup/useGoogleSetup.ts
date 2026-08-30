import { useCallback, useMemo, useState } from 'react'
import { GOOGLE_CALENDAR_SCOPE } from '../../lib/googleCalendar'
import type { GoogleSetup } from '../../domain/types'
import type { CalendarDescriptor, CalendarSession } from '../../providers/calendar'
import { GoogleCalendarRepository } from '../../providers/googleRepository'
import { GoogleIdentityAuth, GOOGLE_LIST_SCOPE } from '../../providers/googleIdentity'
import { GoogleProposalInbox } from '../../providers/proposalInbox'
import { readStorage, writeStorage } from '../../services/storage'

const STORAGE_KEY = 'family-planner-google-setup'
const initial: GoogleSetup = { clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? '', redirectUri: window.location.origin + '/family_planner/', calendarId: import.meta.env.VITE_GOOGLE_SHARED_CALENDAR_ID?.trim() ?? '', proposalCalendarId: import.meta.env.VITE_GOOGLE_PROPOSAL_CALENDAR_ID?.trim() ?? '', connected: false }

export function useGoogleSetup() {
  const [config, setConfig] = useState<GoogleSetup>(() => readStorage(STORAGE_KEY, initial))
  const [session, setSession] = useState<CalendarSession | null>(null)
  const [calendars, setCalendars] = useState<CalendarDescriptor[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const auth = useMemo(() => config.clientId ? new GoogleIdentityAuth(config.clientId, [GOOGLE_LIST_SCOPE, GOOGLE_CALENDAR_SCOPE]) : null, [config.clientId])

  const save = useCallback((next: Partial<GoogleSetup>) => {
    setConfig((current) => { const value = { ...current, ...next }; writeStorage(STORAGE_KEY, { ...value, connected: false }); return value })
  }, [])

  const connect = useCallback(async () => {
    if (!auth) { setError('Enter your public Google OAuth client ID first.'); return }
    setBusy(true); setError('')
    try {
      const nextSession = await auth.connect()
      const repository = new GoogleCalendarRepository(() => nextSession)
      const list = await repository.listCalendars()
      setSession(nextSession); setCalendars(list); setConfig((current) => ({ ...current, connected: true }))
    } catch (value) { setError(value instanceof Error ? value.message : 'Google connection failed.') } finally { setBusy(false) }
  }, [auth])

  const disconnect = useCallback(async () => { await auth?.disconnect(); setSession(null); setCalendars([]); setConfig((current) => ({ ...current, connected: false })) }, [auth])

  const testRead = useCallback(async () => {
    if (!session || !config.calendarId) throw new Error('Connect Google and select a shared calendar first.')
    const repository = new GoogleCalendarRepository(() => session)
    const start = new Date(); const end = new Date(start); end.setDate(start.getDate() + 7)
    return repository.listItems(config.calendarId, start.toISOString(), end.toISOString())
  }, [config.calendarId, session])

  const createItem = useCallback(async (item: Parameters<GoogleCalendarRepository['createItem']>[1]) => {
    if (!session || !config.calendarId) throw new Error('Connect Google and select a shared calendar first.')
    return new GoogleCalendarRepository(() => session).createItem(config.calendarId, item)
  }, [config.calendarId, session])

  const updateItem = useCallback(async (item: Parameters<GoogleCalendarRepository['updateItem']>[1]) => {
    if (!session || !config.calendarId) throw new Error('Connect Google and select a shared calendar first.')
    return new GoogleCalendarRepository(() => session).updateItem(config.calendarId, item)
  }, [config.calendarId, session])

  const deleteItem = useCallback(async (item: Parameters<GoogleCalendarRepository['deleteManagedItem']>[1]) => {
    if (!session || !config.calendarId) throw new Error('Connect Google and select a shared calendar first.')
    return new GoogleCalendarRepository(() => session).deleteManagedItem(config.calendarId, item)
  }, [config.calendarId, session])

  const readProposals = useCallback(async () => {
    if (!session || !config.proposalCalendarId) throw new Error('Connect Google and select a proposal-inbox calendar first.')
    return new GoogleProposalInbox(() => session).list(config.proposalCalendarId)
  }, [config.proposalCalendarId, session])

  const approveProposal = useCallback(async (item: Parameters<GoogleCalendarRepository['createItem']>[1]) => {
    if (!session || !config.calendarId) throw new Error('Connect Google and select a shared calendar first.')
    const repository = new GoogleCalendarRepository(() => session)
    const stored = await repository.createItem(config.calendarId, { ...item, googleEventId: undefined, status: 'approved', managed: true })
    if (item.googleEventId && config.proposalCalendarId) await new GoogleProposalInbox(() => session).delete(config.proposalCalendarId, item.googleEventId)
    return stored
  }, [config.calendarId, config.proposalCalendarId, session])

  return { config, session, calendars, error, busy, save, connect, disconnect, testRead, createItem, updateItem, deleteItem, readProposals, approveProposal }
}
