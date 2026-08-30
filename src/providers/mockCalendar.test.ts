import { describe, expect, it } from 'vitest'
import { MockCalendarRepository } from './mockCalendar'
import { DEMO_ITEMS } from '../domain/constants'

describe('mock calendar repository', () => {
  it('round-trips a managed event and protects unmarked deletion', async () => {
    const repository = new MockCalendarRepository()
    const event = { ...DEMO_ITEMS[0], id: 'test-event', managed: true }
    await repository.createItem('mock-family-calendar', event)
    expect((await repository.listItems()).map((item) => item.id)).toContain('test-event')
    await repository.deleteManagedItem('mock-family-calendar', event)
    await expect(repository.deleteManagedItem('mock-family-calendar', { ...event, managed: false })).rejects.toThrow()
  })
})
