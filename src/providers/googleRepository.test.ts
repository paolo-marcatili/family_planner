import { describe, expect, it } from 'vitest'
import { isGoogleEventOwned, toGoogleEvent } from '../lib/googleCalendar'

describe('Google event mapping', () => {
  it('marks managed events and supports all-day items', () => {
    const event = toGoogleEvent({ id: 'planner-1', title: 'Synthetic task', date: '2026-09-07', nextDate: '2026-09-08' })
    expect(event.start.date).toBe('2026-09-07')
    expect(isGoogleEventOwned(event)).toBe(true)
  })
})
