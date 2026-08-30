export type ImportedProposal = {
  external_id: string
  type: 'event' | 'task' | 'work_day' | 'work_block'
  status: 'proposed'
  source: 'work_schedule' | 'private_calendar' | 'school' | 'manual'
  title?: string
  person?: string
  suggested_assignee?: 'organizer_1' | 'organizer_2' | 'both' | 'unassigned'
  date?: string
  start?: string
  end?: string
  location?: 'office' | 'home' | 'leave' | 'unknown'
  work_status?: 'suggested' | 'confirmed' | 'rejected'
  label?: 'online' | 'listen_only' | 'active' | 'obfuscated'
  priority?: 'critical' | 'important' | 'normal' | 'low'
  flexibility?: 'fixed' | 'flexible' | 'unknown'
  reason?: string
  confidence?: number
}

export type WeeklyPlanImport = {
  schema_version: '1.0'
  week_start: string
  timezone: 'Europe/Copenhagen'
  generated_at: string
  source_summary?: { source_categories?: string[]; notes?: string[] }
  proposals: ImportedProposal[]
}

const allowed = {
  types: ['event', 'task', 'work_day', 'work_block'],
  sources: ['work_schedule', 'private_calendar', 'school', 'manual'],
  assignees: ['organizer_1', 'organizer_2', 'both', 'unassigned'],
  statuses: ['proposed'],
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function validateWeeklyPlan(value: unknown): WeeklyPlanImport {
  if (!isObject(value)) throw new Error('The import must be a JSON object.')
  if (value.schema_version !== '1.0') throw new Error('Only Family Planner schema version 1.0 is supported.')
  if (value.timezone !== 'Europe/Copenhagen') throw new Error('The timezone must be Europe/Copenhagen.')
  if (typeof value.week_start !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.week_start)) throw new Error('week_start must be an ISO date.')
  if (typeof value.generated_at !== 'string' || !value.generated_at.includes('T')) throw new Error('generated_at must be an ISO date-time.')
  if (!Array.isArray(value.proposals)) throw new Error('proposals must be an array.')

  const seen = new Set<string>()
  const proposals = value.proposals.map((raw, index) => {
    if (!isObject(raw)) throw new Error(`Proposal ${index + 1} must be an object.`)
    if (typeof raw.external_id !== 'string' || !/^[A-Za-z0-9._:-]+$/.test(raw.external_id)) throw new Error(`Proposal ${index + 1} has an invalid external_id.`)
    if (seen.has(raw.external_id)) throw new Error(`Duplicate external_id: ${raw.external_id}`)
    seen.add(raw.external_id)
    if (!allowed.types.includes(String(raw.type))) throw new Error(`Proposal ${index + 1} has an unsupported type.`)
    if (!allowed.sources.includes(String(raw.source))) throw new Error(`Proposal ${index + 1} has an unsupported source.`)
    if (raw.status !== 'proposed') throw new Error(`Proposal ${index + 1} must have status proposed.`)
    if (raw.suggested_assignee !== undefined && !allowed.assignees.includes(String(raw.suggested_assignee))) throw new Error(`Proposal ${index + 1} has an unsupported assignee.`)
    return raw as unknown as ImportedProposal
  })
  return { schema_version: '1.0', week_start: value.week_start, timezone: 'Europe/Copenhagen', generated_at: value.generated_at, source_summary: value.source_summary as WeeklyPlanImport['source_summary'], proposals }
}

export function fingerprintProposal(proposal: ImportedProposal) {
  return [proposal.external_id, proposal.type, proposal.date ?? '', proposal.start ?? '', proposal.end ?? ''].join('|')
}
