import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { UserTier } from '../types'
import './SettingsPage.css'

export function SettingsPage() {
  const { session, setTierDemo, login, logout } = useAuth()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const switchTier = async (tier: UserTier) => {
    setBusy(true)
    setMessage(null)
    try {
      await setTierDemo(tier)
      setMessage(
        tier === 1
          ? 'Signed out (Tier 1 guest).'
          : `Signed in as Tier ${tier} demo account.`,
      )
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to switch demo tier. Is the API running?')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="settings-page">
      <h1 className="page-title">Account Settings</h1>
      <p className="page-subtitle">
        Phase 1 keeps multi-seat and multi-site hooks visually quiet while exposing role context.
      </p>

      <section className="settings-panel">
        <h2 className="settings-panel__title">Profile</h2>
        <dl className="settings-dl">
          <div>
            <dt>Display name</dt>
            <dd>{session.displayName}</dd>
          </div>
          <div>
            <dt>Site</dt>
            <dd aria-hidden="true">{session.siteLabel}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{session.roleLabel}</dd>
          </div>
          <div>
            <dt>Verification</dt>
            <dd style={{ fontWeight: 600 }}>{session.verificationStatus}</dd>
          </div>
        </dl>
      </section>

      <section className="settings-panel">
        <h2 className="settings-panel__title">Demo tier switcher</h2>
        <p className="settings-help">
          Uses live auth against the API. Tier 3 = buyer@leanchem.demo, Tier 2 =
          pending@leanchem.demo, Tier 1 = signed out. Password: DemoPass123!
        </p>
        <div className="settings-tiers" role="group" aria-label="Demo account tier">
          {([1, 2, 3] as UserTier[]).map((tier) => (
            <button
              key={tier}
              type="button"
              className={`btn ${session.tier === tier ? 'btn-primary' : 'btn-secondary'}`}
              disabled={busy}
              onClick={() => void switchTier(tier)}
            >
              Tier {tier}
            </button>
          ))}
        </div>
        <div className="settings-tiers" style={{ marginTop: 12 }}>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={busy}
            onClick={() => void login('buyer@leanchem.demo', 'DemoPass123!')}
          >
            Login verified buyer
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => void logout()}
          >
            Logout
          </button>
        </div>
        {message ? <p className="settings-help" style={{ marginTop: 12 }}>{message}</p> : null}
      </section>
    </div>
  )
}
