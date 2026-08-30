import type { PlannerItem } from '../domain/types'
import type { CalendarDescriptor, CalendarRepository } from './calendar'

export class MockCalendarRepository implements CalendarRepository {
  private items: PlannerItem[]
  constructor(items: PlannerItem[] = []) { this.items = structuredClone(items) }
  async listCalendars(): Promise<CalendarDescriptor[]> { return [{ id: 'mock-family-calendar', summary: 'Family Planner (synthetic)', primary: true, accessRole: 'owner' }] }
  async listItems() { return structuredClone(this.items) }
  async createItem(_calendarId: string, item: PlannerItem) { this.items.push(structuredClone(item)); return structuredClone(item) }
  async updateItem(_calendarId: string, item: PlannerItem) { this.items = this.items.map((current) => current.id === item.id ? structuredClone(item) : current); return structuredClone(item) }
  async deleteManagedItem(_calendarId: string, item: PlannerItem) { if (!item.managed) throw new Error('Refusing to delete an unmarked event.'); this.items = this.items.filter((current) => current.id !== item.id) }
}
