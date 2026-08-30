import type { Names, PromptLibrary } from '../../domain/types'
import { DEFAULT_PROMPTS } from '../../domain/constants'
import { GoogleSetupWizard } from '../setup/GoogleSetupWizard'
import type { ReturnTypeUseGoogleSetup } from './types'
import { IngestionSetupCard } from './IngestionSetupCard'

type Props = {
  names: Names
  onNames: (value: Names) => void
  mode: string
  horizon: string
  prompts: PromptLibrary
  onMode: (value: string) => void
  onHorizon: (value: string) => void
  onPrompts: (value: PromptLibrary) => void
  onReset: () => void
  google: ReturnTypeUseGoogleSetup
}

export function SettingsPanel({ names, onNames, mode, horizon, prompts, onMode, onHorizon, onPrompts, onReset, google }: Props) {
  const updatePrompt = (key: keyof PromptLibrary, value: string) => onPrompts({ ...prompts, [key]: value })
  const copy = (key: keyof PromptLibrary) => navigator.clipboard?.writeText(prompts[key])
  return <section className="content-view settings-view">
    <GoogleSetupWizard clientId={google.config.clientId} redirectUri={google.config.redirectUri} calendarId={google.config.calendarId} proposalCalendarId={google.config.proposalCalendarId} connected={google.config.connected} calendars={google.calendars} busy={google.busy} error={google.error} onSave={google.save} onConnect={google.connect} onDisconnect={google.disconnect} onTestRead={async () => (await google.testRead()).length} />
    <IngestionSetupCard />
    <div className="settings-card"><span className="eyebrow">ORGANIZERS</span><h3>Use the names you prefer</h3><label>First organizer<input value={names.paolo} onChange={(event) => onNames({ ...names, paolo: event.target.value })} /></label><label>Second organizer<input value={names.anna} onChange={(event) => onNames({ ...names, anna: event.target.value })} /></label><p className="settings-note">Names are labels stored in app settings and Family Planner metadata—not Google passwords.</p><button className="quiet-button" onClick={onReset}>Reset demo</button></div>
    <div className="settings-card"><span className="eyebrow">PLANNING OPERATING MODEL</span><h3>How much should ChatGPT plan?</h3><label>Mode<select value={mode} onChange={(event) => onMode(event.target.value)}><option>Weekly Review</option><option>Incremental Update</option><option>Urgent Change</option></select></label><label>Planning horizon<select value={horizon} onChange={(event) => onHorizon(event.target.value)}><option>7 days</option><option>14 days</option><option>21 days</option><option>28 days</option></select></label></div>
    <div className="settings-card prompt-card"><span className="eyebrow">CHATGPT PROMPT LIBRARY</span><p className="settings-note">Edit and copy these public-safe templates into company ChatGPT.</p>{(['weekly', 'incremental', 'urgent'] as const).map((key) => <label key={key}>{key === 'weekly' ? 'Weekly / long-term' : key[0].toUpperCase() + key.slice(1)}<textarea value={prompts[key]} onChange={(event) => updatePrompt(key, event.target.value)} /><span className="prompt-actions"><button type="button" className="quiet-button" onClick={() => copy(key)}>Copy prompt</button></span></label>)}<button className="quiet-button" onClick={() => onPrompts(DEFAULT_PROMPTS)}>Reset prompt defaults</button></div>
  </section>
}
