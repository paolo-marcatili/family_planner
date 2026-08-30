import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const days = [
  { day: 'Mon', date: 'Sep 7', you: 'Home · suggested', wife: 'Office', focus: 'Review imported plan' },
  { day: 'Tue', date: 'Sep 8', you: 'Office', wife: 'Home · confirmed', focus: 'School pickup needs owner' },
  { day: 'Wed', date: 'Sep 9', you: 'Home · suggested', wife: 'Unknown', focus: 'No unresolved items' },
  { day: 'Thu', date: 'Sep 10', you: 'Office', wife: 'Home · confirmed', focus: 'Critical online block' },
  { day: 'Fri', date: 'Sep 11', you: 'Home · suggested', wife: 'Office', focus: 'Prepare next import' },
]

function App() {
  return (
    <main className="shell">
      <header className="topbar">
        <div><span className="eyebrow">SHARED HOUSEHOLD</span><h1>Family Planner</h1></div>
        <button className="secondary">Import proposals</button>
      </header>

      <section className="intro">
        <div><span className="eyebrow">WEEK OF 7–13 SEPTEMBER 2026</span><h2>Make the week visible.</h2><p>Review suggested work locations, family commitments, and the decisions that still need an owner.</p></div>
        <div className="review-pill"><strong>3</strong><span>proposals<br />to review</span></div>
      </section>

      <section className="decision-card"><div><span className="eyebrow warm">DECISIONS INBOX</span><h3>Tuesday pickup needs an owner</h3><p>A proposed school pickup overlaps with a critical fixed work block.</p></div><button className="primary">Review now</button></section>

      <section className="section-heading"><div><span className="eyebrow">WEEKLY OVERVIEW</span><h3>Work and family at a glance</h3></div><span className="muted">Europe/Copenhagen · Monday start</span></section>
      <section className="week-grid">
        {days.map((item) => <article className="day-card" key={item.day}><div className="day-title"><strong>{item.day}</strong><span>{item.date}</span></div><div className="person-row"><span>You</span><b className={item.you.includes('suggested') ? 'suggested' : ''}>{item.you}</b></div><div className="person-row"><span>Wife</span><b className={item.wife.includes('confirmed') ? 'confirmed' : ''}>{item.wife}</b></div><hr /><p className="focus">{item.focus}</p></article>)}
      </section>

      <section className="lower-grid"><article className="panel"><span className="eyebrow">RESPONSIBILITIES</span><h3>Who is doing what?</h3><ul><li><span>School pickup · Tue 15:30</span><em>Unassigned</em></li><li><span>Reply to school message</span><em className="assigned">You</em></li><li><span>Activity drop-off · Thu 17:00</span><em className="assigned">Wife</em></li></ul></article><article className="panel"><span className="eyebrow">HOUSEHOLD</span><h3>People and planning scope</h3><div className="people"><span>You</span><span>Wife</span><span>Leo</span><span>Elliott</span><span className="out">Matilde · outside childcare scope</span></div><p className="muted note">AI imports are proposals only. Both organizers approve the final plan.</p></article></section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
