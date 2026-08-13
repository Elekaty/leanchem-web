import { useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Breadcrumbs } from '../components/Breadcrumbs/Breadcrumbs'
import { SITE } from '../data/marketing'
import './ContactPage.css'

export function ContactPage() {
  const [params] = useSearchParams()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    company: '',
    contactName: '',
    email: '',
    phone: '',
    product: params.get('product') ?? '',
    cas: params.get('cas') ?? '',
    volume: '',
    deliveryTerms: 'CIF Djibouti',
    market: params.get('market') ?? '',
    intent: params.get('intent') ?? 'quote',
    notes: '',
  })

  const title = useMemo(
    () => (form.intent === 'sample' ? 'Request a sample' : 'Request a quote'),
    [form.intent],
  )

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="contact-page">
      <div className="contact-page__wrap">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Contact' },
          ]}
        />
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">
          Full RFQ for procurement teams — company, product, volume, and delivery terms. Or email{' '}
          <a href={`mailto:${SITE.emails.commercial}`}>{SITE.emails.commercial}</a>.
        </p>

        {submitted ? (
          <div className="contact-success" role="status">
            <h2>RFQ received</h2>
            <p>
              Thanks — a LeanChem commercial specialist will follow up on {form.product || 'your request'}{' '}
              shortly. For urgent lanes, message us on WhatsApp or Telegram from the chat button.
            </p>
          </div>
        ) : (
          <form className="contact-form" onSubmit={onSubmit}>
            <div className="contact-form__grid">
              <label>
                Company
                <input
                  required
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </label>
              <label>
                Contact name
                <input
                  required
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                />
              </label>
              <label>
                Work email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
              <label>
                Phone
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </label>
              <label>
                Product / grade
                <input
                  required
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                />
              </label>
              <label>
                CAS number
                <input
                  value={form.cas}
                  onChange={(e) => setForm({ ...form, cas: e.target.value })}
                />
              </label>
              <label>
                Volume / MOQ target
                <input
                  required
                  value={form.volume}
                  onChange={(e) => setForm({ ...form, volume: e.target.value })}
                  placeholder="e.g. 4 × 200 L drums / month"
                />
              </label>
              <label>
                Delivery terms
                <select
                  value={form.deliveryTerms}
                  onChange={(e) => setForm({ ...form, deliveryTerms: e.target.value })}
                >
                  <option>CIF Djibouti</option>
                  <option>CFR Djibouti</option>
                  <option>DAP Addis Ababa</option>
                  <option>Ex Works</option>
                  <option>Other / to discuss</option>
                </select>
              </label>
            </div>
            <label className="contact-form__notes">
              Notes for technical / commercial review
              <textarea
                rows={5}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Application, packaging constraints, required documents…"
              />
            </label>
            <button type="submit" className="btn btn-primary">
              Submit RFQ
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
