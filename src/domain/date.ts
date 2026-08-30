export function startOfWeek(reference = new Date()) {
  const date = new Date(reference)
  const day = (date.getDay() + 6) % 7
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - day)
  return date
}

export function weekDates(reference = new Date()) {
  const start = startOfWeek(reference)
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
}

export function minutes(value?: string) {
  if (!value) return 0
  const [hours, mins] = value.split(':').map(Number)
  return hours * 60 + mins
}

export function dateTimeForDay(weekStart: Date, day: number, time: string) {
  const date = new Date(weekStart)
  date.setDate(weekStart.getDate() + day)
  const [hours, mins] = time.split(':').map(Number)
  date.setHours(hours, mins, 0, 0)
  return date.toISOString()
}
