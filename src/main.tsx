import { ChangeEvent, FormEvent, StrictMode, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { downloadApprovedIcs } from './lib/calendarExport'
import { fingerprintProposal, validateWeeklyPlan } from './lib/imports'
import './styles.css'

type Tab = 'calendar' | 'workload' | 'decisions' | 'imports' | 'settings'
type Assignee = 'You' | 'Wife' | 'Both' | 'Unassigned'
type ItemKind = 'event' | 'task'
type ItemStatus = 'approved' | 'proposed' | 'done' | 'deferred' | 'rejected'
type Category = 'School' | 'Childcare' | 'Activity' | 'Appointment' | 'Family' | 'Work' | 'Travel' | 'Task' | 'Other'
type WeatherDay = { date: string; max: number; min: number; rain: number; wind: number; code: number }

type PlannerItem = {
  id: string
  kind: ItemKind
  title: string
  day: number
  start: string
  end: string
  assignee: Assignee
  category: Category
  status: ItemStatus
  recurrence: 'one-off' | 'weekly'
  child?: string
  note?: string
}

function OwnerChooser({ item, onChoose }: { item: PlannerItem; onChoose: (assignee: Assignee) => void }) {
  return <div className="owner-chooser" role="group" aria-label={`Assign ${item.title}`} onClick={(event) => event.stopPropagation()}>{(['You', 'Wife', 'Both', 'Unassigned'] as Assignee[]).map((person) => <button key={person} className={person === item.assignee ? 'selected' : ''} onClick={() => onChoose(person)}>{person}</button>)}</div>
}

const DAYS = [
  { short: 'Mon', date: 'Sep 7', iso: '2026-09-07' },
  { short: 'Tue', date: 'Sep 8', iso: '2026-09-08' },
  { short: 'Wed', date: 'Sep 9', iso: '2026-09-09' },
  { short: 'Thu', date: 'Sep 10', iso: '2026-09-10' },
  { short: 'Fri', date: 'Sep 11', iso: '2026-09-11' },
  { short: 'Sat', date: 'Sep 12', iso: '2026-09-12' },
  { short: 'Sun', date: 'Sep 13', iso: '2026-09-13' },
]

const HOURS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']

const seedItems: PlannerItem[] = [
  { id: 'school-dropoff', kind: 'event', title: 'School drop-off', day: 0, start: '08:00', end: '08:30', assignee: 'Wife', category: 'School', status: 'approved', recurrence: 'weekly', child: 'Child 1 + Child 2' },
  { id: 'work-focus', kind: 'event', title: 'Focus block · listen only', day: 0, start: '10:00', end: '11:00', assignee: 'You', category: 'Work', status: 'approved', recurrence: 'one-off', note: 'Obfuscated work annotation' },
  { id: 'pickup', kind: 'event', title: 'School pickup', day: 1, start: '15:30', end: '16:00', assignee: 'Unassigned', category: 'Childcare', status: 'proposed', recurrence: 'weekly', child: 'Child 1 + Child 2', note: 'Needs organizer decision' },
  { id: 'critical-meeting', kind: 'event', title: 'Online meeting · critical', day: 1, start: '15:00', end: '16:00', assignee: 'You', category: 'Work', status: 'approved', recurrence: 'one-off', note: 'Fixed, active participation' },
  { id: 'reply-school', kind: 'task', title: 'Reply to school message', day: 1, start: '17:00', end: '17:30', assignee: 'You', category: 'Task', status: 'approved', recurrence: 'one-off' },
  { id: 'activity', kind: 'event', title: 'Activity drop-off', day: 3, start: '17:00', end: '17:30', assignee: 'Wife', category: 'Activity', status: 'approved', recurrence: 'weekly', child: 'Child 2' },
  { id: 'shopping', kind: 'task', title: 'Add weekend items to list', day: 4, start: '16:00', end: '16:30', assignee: 'Both', category: 'Task', status: 'done', recurrence: 'one-off' },
]

const emptyForm = {
  title: '',
  kind: 'event' as ItemKind,
  day: 0,
  start: '09:00',
  end: '10:00',
  assignee: 'Unassigned' as Assignee,
  category: 'Family' as Category,
  recurrence: 'one-off' as 'one-off' | 'weekly',
  child: '',
  note: '',
}

const weatherLabels: Record<number, [string, string]> = { 0: ['☀️', 'Clear'], 1: ['🌤️', 'Mostly clear'], 2: ['⛅', 'Partly cloudy'], 3: ['☁️', 'Overcast'], 45: ['🌫️', 'Fog'], 48: ['🌫️', 'Fog'], 51: ['🌦️', 'Drizzle'], 53: ['🌦️', 'Drizzle'], 55: ['🌧️', 'Drizzle'], 61: ['🌧️', 'Rain'], 63: ['🌧️', 'Rain'], 65: ['🌧️', 'Heavy rain'], 71: ['🌨️', 'Snow'], 73: ['🌨️', 'Snow'], 75: ['❄️', 'Heavy snow'], 80: ['🌦️', 'Showers'], 81: ['🌦️', 'Showers'], 82: ['⛈️', 'Heavy showers'], 95: ['⛈️', 'Thunderstorm'] }
function weatherLabel(code: number) { return weatherLabels[code] ?? ['🌥️', 'Mixed conditions'] }

function readItems(): PlannerItem[] {
  try {
    const stored = window.localStorage.getItem('family-planner-demo-items')
    return stored ? JSON.parse(stored) as PlannerItem[] : seedItems
  } catch {
    return seedItems
  }
}

function App() {
  const [items, setItems] = useState<PlannerItem[]>(readItems)
  const [tab, setTab] = useState<Tab>('calendar')
  const [editing, setEditing] = useState<PlannerItem | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [notice, setNotice] = useState('')
  const [assigning, setAssigning] = useState<string | null>(null)
  const [weather, setWeather] = useState<WeatherDay[] | null>(null)
  const [weatherState, setWeatherState] = useState<'loading' | 'ready' | 'error'>('loading')
  const importInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    window.localStorage.setItem('family-planner-demo-items', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    const cached = window.localStorage.getItem('family-planner-weather')
    if (cached) {
      try {
        const saved = JSON.parse(cached) as { expires: number; days: WeatherDay[] }
        if (saved.expires > Date.now()) { setWeather(saved.days); setWeatherState('ready'); return }
      } catch { /* fetch fresh data */ }
    }
    fetch('https://api.open-meteo.com/v1/forecast?latitude=55.6761&longitude=12.5683&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=Europe%2FCopenhagen&forecast_days=7')
      .then((response) => { if (!response.ok) throw new Error('weather request failed'); return response.json() as Promise<{ daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[]; wind_speed_10m_max: number[] } }> })
      .then((payload) => { const days = payload.daily.time.map((date, index) => ({ date, max: Math.round(payload.daily.temperature_2m_max[index]), min: Math.round(payload.daily.temperature_2m_min[index]), rain: payload.daily.precipitation_probability_max[index], wind: Math.round(payload.daily.wind_speed_10m_max[index]), code: payload.daily.weather_code[index] })); setWeather(days); setWeatherState('ready'); window.localStorage.setItem('family-planner-weather', JSON.stringify({ expires: Date.now() + 30 * 60 * 1000, days })) })
      .catch(() => setWeatherState('error'))
  }, [])

  const proposals = items.filter((item) => item.status === 'proposed')
  const openTasks = items.filter((item) => item.kind === 'task' && item.status !== 'done' && item.status !== 'rejected')
  const byAssignee = useMemo(() => ({
    You: items.filter((item) => item.assignee === 'You' && item.status !== 'rejected').length,
    Wife: items.filter((item) => item.assignee === 'Wife' && item.status !== 'rejected').length,
    Both: items.filter((item) => item.assignee === 'Both' && item.status !== 'rejected').length,
    Unassigned: items.filter((item) => item.assignee === 'Unassigned' && item.status !== 'rejected').length,
  }), [items])

  function showNotice(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3500)
  }

  function openCreate(day = 0, start = '09:00') {
    const hour = Number(start.slice(0, 2))
    setForm({ ...emptyForm, day, start, end: `${String(Math.min(hour + 1, 20)).padStart(2, '0')}:00` })
    setEditing(null)
    setCreating(true)
  }

  function openEdit(item: PlannerItem) {
    setEditing(item)
    setForm({ title: item.title, kind: item.kind, day: item.day, start: item.start, end: item.end, assignee: item.assignee, category: item.category, recurrence: item.recurrence, child: item.child ?? '', note: item.note ?? '' })
    setCreating(true)
  }

  function saveItem(event: FormEvent) {
    event.preventDefault()
    if (!form.title.trim()) return
    if (editing) {
      setItems((current) => current.map((item) => item.id === editing.id ? { ...item, ...form, title: form.title.trim() } : item))
      showNotice('Changes saved locally in this browser.')
    } else {
      setItems((current) => [...current, { ...form, id: `local-${Date.now()}`, title: form.title.trim(), status: 'approved' }])
      showNotice('Item added to this week.')
    }
    setCreating(false)
  }

  function removeItem() {
    if (!editing) return
    setItems((current) => current.filter((item) => item.id !== editing.id))
    setCreating(false)
    showNotice('Item removed from this browser demo.')
  }

  function setItemStatus(id: string, status: ItemStatus) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item))
    showNotice(status === 'approved' ? 'Proposal approved and added to the plan.' : `Proposal marked ${status}.`)
  }

  function setAssignee(id: string, assignee: Assignee) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, assignee } : item))
    setAssigning(null)
    showNotice(`Assigned to ${assignee}.`)
  }

  function toggleTask(id: string) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, status: item.status === 'done' ? 'approved' : 'done' } : item))
    showNotice('Task status updated.')
  }

  function resetDemo() {
    setItems(seedItems)
    showNotice('Demo data reset.')
  }

  function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const payload = validateWeeklyPlan(JSON.parse(String(reader.result)))
        const existingFingerprints = new Set(items.map((item) => item.note?.startsWith('Imported fingerprint: ') ? item.note.slice(22) : ''))
        const imported = payload.proposals.map((proposal, index): PlannerItem => ({
          id: `proposal-${proposal.external_id}`,
          kind: proposal.type === 'task' ? 'task' : 'event',
          title: proposal.title ?? (proposal.type === 'work_day' ? `Work day · ${proposal.location ?? 'unknown'}` : proposal.type === 'work_block' ? `${proposal.label ?? 'Work'} block` : `Imported ${proposal.type}`),
          day: proposal.date ? Math.max(0, Math.min(6, Math.round((new Date(`${proposal.date}T12:00:00`).getTime() - new Date(`${payload.week_start}T12:00:00`).getTime()) / 86400000))) : index % 7,
          start: proposal.start?.slice(11, 16) || '09:00',
          end: proposal.end?.slice(11, 16) || '10:00',
          assignee: proposal.suggested_assignee === 'organizer_1' ? 'You' : proposal.suggested_assignee === 'organizer_2' ? 'Wife' : proposal.suggested_assignee === 'both' ? 'Both' : 'Unassigned',
          category: proposal.type === 'task' ? 'Task' : proposal.source === 'school' ? 'School' : proposal.type === 'work_day' || proposal.type === 'work_block' ? 'Work' : 'Family',
          status: 'proposed',
          recurrence: 'one-off',
          note: `Imported fingerprint: ${fingerprintProposal(proposal)}${proposal.reason ? ` · ${proposal.reason}` : ''}`,
        }))
        const fresh = imported.filter((item) => !existingFingerprints.has(item.note?.slice(22) ?? ''))
        setItems((current) => [...current, ...fresh.filter((item) => !current.some((existing) => existing.id === item.id))])
        showNotice(`Import preview ready: ${fresh.length} new proposal(s) added to Decisions. Review before approval.`)
        setTab('decisions')
      } catch {
        showNotice('Import rejected: choose a Family Planner JSON 1.0 file.')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">FP</span><div><strong>Family Planner</strong><small>Shared household</small></div></div>
        <nav aria-label="Main navigation">
          <NavButton active={tab === 'calendar'} icon="▦" label="Calendar" onClick={() => setTab('calendar')} />
          <NavButton active={tab === 'workload'} icon="◒" label="Workload" badge={String(openTasks.length)} onClick={() => setTab('workload')} />
          <NavButton active={tab === 'decisions'} icon="◇" label="Decisions" badge={String(proposals.length)} onClick={() => setTab('decisions')} />
          <NavButton active={tab === 'imports'} icon="↥" label="Imports" onClick={() => setTab('imports')} />
          <NavButton active={tab === 'settings'} icon="⚙" label="Settings" onClick={() => setTab('settings')} />
        </nav>
        <div className="sidebar-bottom"><div className="privacy-note"><span>●</span><div><strong>Local demo mode</strong><small>Saved in this browser only</small></div></div><button className="link-button" onClick={resetDemo}>Reset demo data</button></div>
      </aside>

      <section className="main-panel">
        <header className="topbar"><div><span className="eyebrow">WEEK OF 7–13 SEPTEMBER 2026</span><h1>{tab === 'calendar' ? 'Plan the week together.' : tabTitle(tab)}</h1></div><div className="top-actions"><button className="quiet-button" onClick={() => setTab('imports')}>Import JSON</button><button className="primary-button" onClick={() => openCreate()}>＋ Add item</button><div className="avatar-pair"><span>Y</span><span>W</span></div></div></header>
        {notice && <div className="toast" role="status">{notice}</div>}
        {tab === 'calendar' && <CalendarView items={items} onCreate={openCreate} onEdit={openEdit} assigning={assigning} onAssign={(id) => setAssigning(assigning === id ? null : id)} onChooseOwner={setAssignee} onToggleTask={toggleTask} onSync={showNotice} onExport={() => { downloadApprovedIcs(items); showNotice('Approved items exported as an ICS file.') }} weather={weather} weatherState={weatherState} onRetry={() => window.location.reload()} />}
        {tab === 'workload' && <WorkloadView items={items} byAssignee={byAssignee} onEdit={openEdit} onToggleTask={toggleTask} />}
        {tab === 'decisions' && <DecisionsView proposals={proposals} onEdit={openEdit} onStatus={setItemStatus} />}
        {tab === 'imports' && <ImportsView onChoose={() => importInput.current?.click()} />}
        {tab === 'settings' && <SettingsView onReset={resetDemo} />}
        <input ref={importInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={importFile} />
      </section>
      {creating && <EditDialog form={form} editing={editing} onChange={setForm} onSave={saveItem} onDelete={removeItem} onClose={() => setCreating(false)} />}
    </main>
  )
}

function NavButton({ active, icon, label, badge, onClick }: { active: boolean; icon: string; label: string; badge?: string; onClick: () => void }) {
  return <button className={`nav-button ${active ? 'active' : ''}`} onClick={onClick}><span className="nav-icon">{icon}</span><span>{label}</span>{badge && <b>{badge}</b>}</button>
}

function tabTitle(tab: Tab) {
  return { workload: 'Balance the load.', decisions: 'Decisions need you.', imports: 'Bring in the week.', settings: 'Make it work for you.', calendar: 'Plan the week together.' }[tab]
}

function CalendarView({ items, onCreate, onEdit, assigning, onAssign, onChooseOwner, onToggleTask, onSync, onExport, weather, weatherState, onRetry }: { items: PlannerItem[]; onCreate: (day?: number, start?: string) => void; onEdit: (item: PlannerItem) => void; assigning: string | null; onAssign: (id: string) => void; onChooseOwner: (id: string, assignee: Assignee) => void; onToggleTask: (id: string) => void; onSync: (message: string) => void; onExport: () => void; weather: WeatherDay[] | null; weatherState: 'loading' | 'ready' | 'error'; onRetry: () => void }) {
  return <>
    <section className="calendar-toolbar"><div className="week-switcher"><button aria-label="Previous week">‹</button><strong>September 7 – 13, 2026</strong><button aria-label="Next week">›</button><button className="today-button">Today</button></div><div className="legend"><span><i className="dot blue" />Suggested</span><span><i className="dot green" />Confirmed</span><span><i className="dot amber" />Needs decision</span></div></section>
    <WeatherStrip weather={weather} state={weatherState} onRetry={onRetry} />
    <section className="decision-strip"><div><span className="eyebrow amber-text">DECISIONS INBOX</span><strong>{items.filter((item) => item.status === 'proposed').length} items need review</strong><span>Suggested changes remain separate until you approve them.</span></div><button className="outline-button" onClick={() => onEdit(items.find((item) => item.status === 'proposed') ?? items[0])}>Review suggestions →</button></section>
    <section className="calendar-grid" aria-label="Weekly calendar">
      <div className="time-column"><div className="all-day-label">ALL DAY</div>{HOURS.map((hour) => <span key={hour}>{hour}</span>)}</div>
      {DAYS.map((day, dayIndex) => <div className="day-column" key={day.iso}><button className="day-header" onClick={() => onCreate(dayIndex)}><strong>{day.short}</strong><span>{day.date}</span><em>＋</em></button><div className="day-body">{HOURS.map((hour) => <button className="time-slot" key={hour} aria-label={`Add item ${day.short} ${hour}`} onClick={() => onCreate(dayIndex, hour)} />)}{items.filter((item) => item.day === dayIndex && item.status !== 'rejected').map((item) => <CalendarItem key={item.id} item={item} onEdit={onEdit} onAssign={onAssign} onChooseOwner={onChooseOwner} assigning={assigning === item.id} onToggleTask={onToggleTask} />)}</div></div>)}
    </section>
    <section className="calendar-footer"><div className="sync-heading"><span className="eyebrow">TIME BLOCKING SHORTCUTS</span><h3>Protect the time around the plan.</h3><p>These are connection-ready placeholders. No calendar account is connected in the local demo.</p><button className="quiet-button export-button" onClick={onExport}>↓ Export approved .ics</button></div><div className="sync-cards"><SyncCard icon="↗" title="Private calendar" text="Block approved family time" onClick={() => onSync('Private-calendar sync is not connected yet.')} /><SyncCard icon="▣" title="Work calendar" text="Block commute or focus time" onClick={() => onSync('Work-calendar sync is not connected yet.')} /><SyncCard icon="⇄" title="Commute buffer" text="Add travel before and after" onClick={() => onSync('Commute buffers are planned for the calendar integration phase.')} /></div></section>
  </>
}

function WeatherStrip({ weather, state, onRetry }: { weather: WeatherDay[] | null; state: 'loading' | 'ready' | 'error'; onRetry: () => void }) {
  if (state === 'loading') return <section className="weather-strip loading-weather"><span className="weather-pin">☁</span><span><strong>Copenhagen weather</strong><small>Loading forecast…</small></span></section>
  if (state === 'error' || !weather) return <section className="weather-strip error-weather"><span className="weather-pin">☁</span><span><strong>Copenhagen weather unavailable</strong><small>Calendar remains available. Check your connection and retry.</small></span><button className="quiet-button" onClick={onRetry}>Retry</button></section>
  return <section className="weather-strip"><div className="weather-location"><span className="weather-pin">{weatherLabel(weather[0].code)[0]}</span><span><strong>Copenhagen area</strong><small>7-day forecast · metric units</small></span></div><div className="weather-days">{weather.map((day) => <div className="weather-day" key={day.date}><strong>{new Intl.DateTimeFormat('en-DK', { weekday: 'short' }).format(new Date(`${day.date}T12:00:00`))}</strong><span>{weatherLabel(day.code)[0]}</span><b>{day.max}° <small>{day.min}°</small></b><em>{day.rain}% rain</em></div>)}</div></section>
}

function CalendarItem({ item, onEdit, onAssign, onChooseOwner, assigning, onToggleTask }: { item: PlannerItem; onEdit: (item: PlannerItem) => void; onAssign: (id: string) => void; onChooseOwner: (id: string, assignee: Assignee) => void; assigning: boolean; onToggleTask: (id: string) => void }) {
  const startMinutes = toMinutes(item.start) - 7 * 60
  const endMinutes = toMinutes(item.end) - 7 * 60
  return <article className={`calendar-item ${item.status} ${item.kind}`} style={{ top: `${Math.max(startMinutes, 0) * 56 / 60}px`, height: `${Math.max(endMinutes - startMinutes, 45) * 56 / 60}px` }} onClick={() => onEdit(item)}>{item.kind === 'task' && <button className={`task-check ${item.status === 'done' ? 'done' : ''}`} aria-label={item.status === 'done' ? 'Mark task open' : 'Confirm task complete'} onClick={(event) => { event.stopPropagation(); onToggleTask(item.id) }}>{item.status === 'done' ? '✓' : ''}</button>}<button className="item-title" onClick={(event) => { event.stopPropagation(); onEdit(item) }}>{item.title}</button><span className="item-time">{item.start}–{item.end}</span><button className={`assignee-chip ${item.assignee === 'Unassigned' ? 'unassigned' : ''}`} onClick={(event) => { event.stopPropagation(); onAssign(item.id) }}>{item.assignee === 'Unassigned' ? 'Assign owner' : item.assignee}</button>{assigning && <OwnerChooser item={item} onChoose={(assignee) => onChooseOwner(item.id, assignee)} />}{item.recurrence === 'weekly' && <span className="repeat-mark">↻</span>}{item.status === 'proposed' && <span className="proposal-mark">PROPOSED</span>}</article>
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function SyncCard({ icon, title, text, onClick }: { icon: string; title: string; text: string; onClick: () => void }) {
  return <button className="sync-card" onClick={onClick}><span className="sync-icon">{icon}</span><span><strong>{title}</strong><small>{text}</small></span><span className="arrow">→</span></button>
}

function WorkloadView({ items, byAssignee, onEdit, onToggleTask }: { items: PlannerItem[]; byAssignee: Record<Assignee, number>; onEdit: (item: PlannerItem) => void; onToggleTask: (id: string) => void }) {
  const active = items.filter((item) => item.status !== 'rejected' && item.status !== 'done')
  return <section className="content-view"><div className="view-intro"><div><span className="eyebrow">RESPONSIBILITY OVERVIEW</span><p>Use this view to spot an uneven week before it becomes a problem.</p></div><button className="quiet-button">This week ▾</button></div><div className="workload-cards">{(['You', 'Wife', 'Both', 'Unassigned'] as Assignee[]).map((person) => <div className={`workload-card ${person === 'Unassigned' ? 'warning-card' : ''}`} key={person}><span>{person}</span><strong>{byAssignee[person]}</strong><small>{person === 'Unassigned' ? 'need decisions' : 'assigned items'}</small><div className="load-bar"><i style={{ width: `${Math.min(byAssignee[person] * 16, 100)}%` }} /></div></div>)}</div><div className="panel-table"><div className="panel-heading"><div><span className="eyebrow">OPEN ITEMS</span><h3>Every responsibility in one place</h3></div><span className="muted">{active.length} active</span></div>{active.map((item) => <div className="table-row" key={item.id}><span className={`category-dot ${item.category.toLowerCase()}`} /><span className="row-main"><button className="row-link" onClick={() => onEdit(item)}><strong>{item.title}</strong><small>{DAYS[item.day].short} · {item.start} · {item.category}</small></button></span>{item.kind === 'task' && <button className={`task-check inline ${item.status === 'done' ? 'done' : ''}`} aria-label={item.status === 'done' ? 'Mark task open' : 'Confirm task complete'} onClick={() => onToggleTask(item.id)}>{item.status === 'done' ? '✓' : ''}</button>}<span className={item.assignee === 'Unassigned' ? 'row-warning' : 'row-assignee'}>{item.assignee}</span><span>›</span></div>)}</div></section>
}

function DecisionsView({ proposals, onEdit, onStatus }: { proposals: PlannerItem[]; onEdit: (item: PlannerItem) => void; onStatus: (id: string, status: ItemStatus) => void }) {
  return <section className="content-view"><div className="view-intro"><div><span className="eyebrow amber-text">AI PROPOSALS</span><p>Review imported suggestions one by one. Nothing is accepted automatically.</p></div><span className="status-count">{proposals.length} pending</span></div>{proposals.length === 0 ? <div className="empty-state"><strong>Nothing needs a decision.</strong><span>New proposals from a JSON import will appear here.</span></div> : <div className="proposal-list">{proposals.map((item) => <article className="proposal-card" key={item.id}><div className="proposal-copy"><span className="proposal-type">{item.category} · {item.recurrence}</span><h3>{item.title}</h3><p>{DAYS[item.day].short} {DAYS[item.day].date} · {item.start}–{item.end} · suggested owner: {item.assignee}</p><small>{item.note ?? 'Imported proposal awaiting organizer review.'}</small></div><div className="proposal-actions"><button className="approve-button" onClick={() => onStatus(item.id, 'approved')}>Approve</button><button className="edit-button" onClick={() => onEdit(item)}>Edit</button><button className="reject-button" onClick={() => onStatus(item.id, 'deferred')}>Defer</button></div></article>)}</div>}</section>
}

function ImportsView({ onChoose }: { onChoose: () => void }) {
  return <section className="content-view import-view"><div className="import-hero"><div><span className="eyebrow">JSON IMPORT</span><h2>Bring in a condensed week.</h2><p>Upload a version 1.0 proposal file from your planning assistant. It will be previewed as suggestions before anything is added to the accepted plan.</p><button className="primary-button" onClick={onChoose}>Choose JSON file</button></div><div className="file-icon">{`{ }`}</div></div><div className="import-rules"><div><span className="rule-number">01</span><strong>Validate</strong><p>Schema version, dates, categories, and proposal fields are checked.</p></div><div><span className="rule-number">02</span><strong>Preview</strong><p>Events, tasks, work days, and work blocks remain proposed.</p></div><div><span className="rule-number">03</span><strong>Decide</strong><p>Both organizers can approve, edit, reject, or defer each item.</p></div></div><div className="info-callout"><strong>Privacy boundary</strong><span>Send condensed and obfuscated information only. Never upload raw work calendars, school messages, feed URLs, or credentials.</span></div></section>
}

function SettingsView({ onReset }: { onReset: () => void }) {
  return <section className="content-view settings-view"><div className="settings-card"><span className="eyebrow">HOUSEHOLD SETTINGS</span><h3>Shared planning defaults</h3><label>Household name<input defaultValue="Our family" /></label><label>Timezone<select defaultValue="Europe/Copenhagen"><option>Europe/Copenhagen</option></select></label><label>Week starts on<select defaultValue="Monday"><option>Monday</option><option>Sunday</option></select></label><div className="people-setting"><span>People in the household</span><div><b>You</b><b>Wife</b><b>Child 1</b><b>Child 2</b><b className="muted-person">Older household member · outside childcare scope</b></div></div><p className="settings-note">Authentication and shared persistence will be connected when the backend is implemented. The current prototype stores edits only in this browser.</p><button className="quiet-button" onClick={onReset}>Reset local demo data</button></div><div className="settings-card"><span className="eyebrow">INTEGRATIONS</span><h3>Calendar connections</h3><div className="integration-row"><span className="integration-logo">G</span><span><strong>Private calendar</strong><small>Not connected</small></span><button className="quiet-button">Planned</button></div><div className="integration-row"><span className="integration-logo outlook">O</span><span><strong>Work calendar</strong><small>Free/busy boundary planned</small></span><button className="quiet-button">Planned</button></div></div></section>
}

function EditDialog({ form, editing, onChange, onSave, onDelete, onClose }: { form: typeof emptyForm; editing: PlannerItem | null; onChange: (form: typeof emptyForm) => void; onSave: (event: FormEvent) => void; onDelete: () => void; onClose: () => void }) {
  const update = (key: keyof typeof emptyForm, value: string | number) => onChange({ ...form, [key]: value })
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><form className="edit-dialog" onSubmit={onSave}><div className="dialog-header"><div><span className="eyebrow">{editing ? 'EDIT ITEM' : 'NEW ITEM'}</span><h2>{editing ? 'Change the plan' : 'Add to the plan'}</h2></div><button type="button" className="close-button" onClick={onClose}>×</button></div><div className="form-grid"><label className="full-width">Title<input autoFocus value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="e.g. School pickup" /></label><label>Type<select value={form.kind} onChange={(event) => update('kind', event.target.value)}><option value="event">Event</option><option value="task">Task</option></select></label><label>Category<select value={form.category} onChange={(event) => update('category', event.target.value)}>{['School', 'Childcare', 'Activity', 'Appointment', 'Family', 'Work', 'Travel', 'Task', 'Other'].map((category) => <option key={category}>{category}</option>)}</select></label><label>Day<select value={form.day} onChange={(event) => update('day', Number(event.target.value))}>{DAYS.map((day, index) => <option value={index} key={day.iso}>{day.short} · {day.date}</option>)}</select></label><label>Owner<select value={form.assignee} onChange={(event) => update('assignee', event.target.value)}><option>You</option><option>Wife</option><option>Both</option><option>Unassigned</option></select></label><label>Starts<input type="time" value={form.start} onChange={(event) => update('start', event.target.value)} /></label><label>Ends<input type="time" value={form.end} onChange={(event) => update('end', event.target.value)} /></label><label>Repeats<select value={form.recurrence} onChange={(event) => update('recurrence', event.target.value)}><option value="one-off">One-off</option><option value="weekly">Every week</option></select></label><label className="full-width">Child / people involved<input value={form.child} onChange={(event) => update('child', event.target.value)} placeholder="Optional" /></label><label className="full-width">Note<input value={form.note} onChange={(event) => update('note', event.target.value)} placeholder="Optional context or obfuscated annotation" /></label></div><div className="dialog-footer">{editing ? <button type="button" className="delete-button" onClick={onDelete}>Delete</button> : <span /> }<div><button type="button" className="quiet-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">{editing ? 'Save changes' : 'Add item'}</button></div></div></form></div>
}

export default App

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
