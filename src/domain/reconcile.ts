import type { PlannerItem } from './types'

export type CalendarDelta = { added: PlannerItem[]; changed: Array<{ before: PlannerItem; after: PlannerItem }>; removed: PlannerItem[]; merged: PlannerItem[] }
const comparable = (item: PlannerItem) => JSON.stringify({ title: item.title, date: item.date, start: item.start, end: item.end, owner: item.owner, category: item.category, status: item.status, importance: item.importance, note: item.note, providerUpdatedAt: item.providerUpdatedAt, providerEtag: item.providerEtag })

/** Remote Google events win; local unsynced proposals/drafts remain visible. */
export function reconcileCalendar(local: PlannerItem[], remote: PlannerItem[]): CalendarDelta {
  const localRemote = new Map(local.filter((item) => item.googleEventId).map((item) => [item.googleEventId!, item]))
  const remoteMap = new Map(remote.filter((item) => item.googleEventId).map((item) => [item.googleEventId!, item]))
  const added = remote.filter((item) => item.googleEventId && !localRemote.has(item.googleEventId))
  const changed = remote.flatMap((item) => { const before = item.googleEventId ? localRemote.get(item.googleEventId) : undefined; return before && comparable(before) !== comparable(item) ? [{ before, after: item }] : [] })
  const removed = [...localRemote.entries()].filter(([id]) => !remoteMap.has(id)).map(([, item]) => item)
  const drafts = local.filter((item) => !item.googleEventId && (item.status === 'proposed' || item.id.startsWith('local-')))
  return { added, changed, removed, merged: [...remote, ...drafts.filter((draft) => !remote.some((item) => item.id === draft.id))] }
}
