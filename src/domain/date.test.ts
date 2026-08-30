import { describe, expect, it } from 'vitest'
import { startOfWeek, weekDates } from './date'

describe('week dates', () => {
  it('starts on Monday', () => {
    const start = startOfWeek(new Date('2026-08-30T12:00:00Z'))
    expect(start.getDay()).toBe(1)
    expect(weekDates(start)).toHaveLength(7)
  })
})
