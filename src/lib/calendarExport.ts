export type ExportableCalendarItem = {
  id: string
  title: string
  start: string
  end: string
  day: number
  status: string
  note?: string
}

const escapeIcs = (value: string) => value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

function utcStamp(day: number, time: string) {
  const date = new Date(`2026-09-${String(7 + day).padStart(2, '0')}T${time}:00+02:00`)
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

export function approvedItemsToIcs(items: ExportableCalendarItem[]) {
  const approved = items.filter((item) => item.status === 'approved' || item.status === 'done')
  const events = approved.map((item) => [
    'BEGIN:VEVENT',
    `UID:${escapeIcs(item.id)}@family-planner`,
    `DTSTAMP:${utcStamp(0, '12:00')}`,
    `DTSTART:${utcStamp(item.day, item.start)}`,
    `DTEND:${utcStamp(item.day, item.end)}`,
    `SUMMARY:${escapeIcs(item.title)}`,
    item.note ? `DESCRIPTION:${escapeIcs(item.note)}` : '',
    'END:VEVENT',
  ].filter(Boolean).join('\r\n')).join('\r\n')
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Family Planner//Approved Blocks//EN', 'CALSCALE:GREGORIAN', events, 'END:VCALENDAR', ''].join('\r\n')
}

export function downloadApprovedIcs(items: ExportableCalendarItem[]) {
  const blob = new Blob([approvedItemsToIcs(items)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'family-planner-approved-blocks.ics'
  link.click()
  URL.revokeObjectURL(url)
}
