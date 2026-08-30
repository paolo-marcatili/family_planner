import { describe, expect, it } from 'vitest'
import { reconcileCalendar } from './reconcile'
import { DEMO_ITEMS } from './constants'

it('uses remote versions and preserves local proposals', () => {
  const local = [{ ...DEMO_ITEMS[0], googleEventId: 'g1', title: 'Old' }, { ...DEMO_ITEMS[2], id: 'local-proposal', googleEventId: undefined }]
  const remote = [{ ...DEMO_ITEMS[0], googleEventId: 'g1', title: 'Changed in Google' }]
  const delta = reconcileCalendar(local, remote)
  expect(delta.changed).toHaveLength(1)
  expect(delta.merged.some((item) => item.id === 'local-proposal')).toBe(true)
})
