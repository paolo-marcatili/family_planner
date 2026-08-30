import { useState } from 'react'

function generateToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function IngestionSetupCard() {
  const [token, setToken] = useState('')
  return <section className="settings-card ingestion-card">
    <span className="eyebrow">CHATGPT INGESTION BRIDGE</span>
    <h3>Create a separate integration token</h3>
    <p className="settings-note">This is not your Google password. Generate it locally, copy it once into Apps Script Properties as <code>FP_INGEST_TOKEN</code>, and store the same value only in your ChatGPT Action's protected configuration. The token is not saved by this page.</p>
    {!token ? <button className="primary-button" onClick={() => setToken(generateToken())}>Generate ingestion token</button> : <><label>One-time token<input readOnly value={token} /></label><div className="wizard-actions"><button className="quiet-button" onClick={() => navigator.clipboard?.writeText(token)}>Copy token</button><button className="quiet-button" onClick={() => setToken('')}>Clear from screen</button></div></>}
    <p className="settings-note">Then deploy `apps-script/` following `docs/chatgpt-ingestion.md`. If corporate ChatGPT cannot inject a protected body token, use JSON file upload instead.</p>
  </section>
}
