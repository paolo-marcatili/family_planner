export type View = 'calendar' | 'workload' | 'decisions' | 'imports' | 'settings'
export type Owner = 'Paolo' | 'Anna' | 'Both' | 'Unassigned'
export type Importance = 'critical' | 'important' | 'normal' | 'low'
export type ItemKind = 'event' | 'task'
export type ItemStatus = 'approved' | 'proposed' | 'done' | 'deferred'
export type Category = 'School' | 'Childcare' | 'Activity' | 'Appointment' | 'Family' | 'Work' | 'Travel' | 'Task' | 'Other'
export type Names = { paolo: string; anna: string }

export type PlannerItem = {
  id: string
  googleEventId?: string
  kind: ItemKind
  title: string
  date?: string
  day: number
  start?: string
  end?: string
  owner: Owner
  category: Category
  status: ItemStatus
  recurrence: 'one-off' | 'weekly'
  importance: Importance
  people?: string
  note?: string
  effortMinutes?: number
  managed?: boolean
  linkedTaskId?: string
  metadata?: string
  providerUpdatedAt?: string
  providerEtag?: string
}

export type PlannerForm = {
  title: string
  kind: ItemKind
  day: number
  start: string
  end: string
  owner: Owner
  category: Category
  recurrence: 'one-off' | 'weekly'
  importance: Importance
  people: string
  note: string
  linkedTaskId?: string
}

export type GoogleSetup = {
  clientId: string
  redirectUri: string
  calendarId: string
  proposalCalendarId: string
  connected: boolean
}

export type PromptLibrary = { weekly: string; incremental: string; urgent: string }
